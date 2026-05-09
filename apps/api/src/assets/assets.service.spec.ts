import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetPurpose, AssetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssetsService } from './assets.service';
import { COMPANY_LOGO_MAX_BYTES } from './logo-asset.constants';

const mockS3Send = jest.fn();
const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  class MockS3Command {
    constructor(readonly input: unknown) {}
  }

  return {
    HeadObjectCommand: MockS3Command,
    PutObjectCommand: MockS3Command,
    S3Client: jest.fn(() => ({ send: mockS3Send })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: async (...args: unknown[]) =>
    (await mockGetSignedUrl(...args)) as string,
}));

describe('AssetsService', () => {
  const env = {
    AWS_REGION: 'ap-northeast-2',
    S3_ASSET_BUCKET: 'cpa-assets',
    S3_PUBLIC_BASE_URL: 'https://cpa-assets.s3.ap-northeast-2.amazonaws.com',
    S3_PRESIGN_EXPIRES_SECONDS: '300',
  };
  const config = {
    get: jest.fn((key: keyof typeof env) => env[key]),
  } as unknown as ConfigService;

  let prisma: {
    company: { findUnique: jest.Mock };
    asset: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let service: AssetsService;

  beforeEach(() => {
    prisma = {
      company: { findUnique: jest.fn() },
      asset: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    mockS3Send.mockReset();
    mockGetSignedUrl
      .mockReset()
      .mockResolvedValue('https://signed.example.com');
    service = new AssetsService(prisma as unknown as PrismaService, config);
  });

  it('rejects company logo upload URLs for users without a company', async () => {
    prisma.company.findUnique.mockResolvedValue(null);

    await expect(
      service.createCompanyLogoUploadUrl('user-1', {
        fileName: 'logo.png',
        contentType: 'image/png',
        byteSize: 100,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.asset.create).not.toHaveBeenCalled();
  });

  it('rejects invalid company logo content types and oversized files', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 'company-1' });

    await expect(
      service.createCompanyLogoUploadUrl('user-1', {
        fileName: 'logo.svg',
        contentType: 'image/svg+xml',
        byteSize: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createCompanyLogoUploadUrl('user-1', {
        fileName: 'logo.png',
        contentType: 'image/png',
        byteSize: COMPANY_LOGO_MAX_BYTES + 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.asset.create).not.toHaveBeenCalled();
  });

  it('creates a pending asset and returns a presigned upload URL', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
    let capturedCreateArg: unknown;
    prisma.asset.create.mockImplementation((args: unknown) => {
      capturedCreateArg = args;
      return Promise.resolve({
        id: 'asset-1',
        publicUrl:
          'https://cpa-assets.s3.ap-northeast-2.amazonaws.com/company-logos/company-1/logo.png',
      });
    });

    const result = await service.createCompanyLogoUploadUrl('user-1', {
      fileName: ' logo.png ',
      contentType: 'image/png',
      byteSize: 123,
    });

    const createArg = capturedCreateArg as {
      data: Record<string, unknown>;
    };
    expect(createArg.data).toMatchObject({
      purpose: AssetPurpose.COMPANY_LOGO,
      status: AssetStatus.PENDING,
      bucket: 'cpa-assets',
      region: 'ap-northeast-2',
      contentType: 'image/png',
      byteSize: 123,
      originalName: 'logo.png',
      uploadedById: 'user-1',
      companyId: 'company-1',
    });
    expect(mockGetSignedUrl).toHaveBeenCalled();
    expect(result).toMatchObject({
      assetId: 'asset-1',
      uploadUrl: 'https://signed.example.com',
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
    });
  });

  it('marks a pending asset ready after HeadObject verification', async () => {
    prisma.asset.findFirst.mockResolvedValue({
      id: 'asset-1',
      status: AssetStatus.PENDING,
      bucket: 'cpa-assets',
      region: 'ap-northeast-2',
      key: 'company-logos/company-1/logo.png',
      contentType: 'image/png',
      byteSize: 123,
      publicUrl: 'https://assets.example.com/logo.png',
    });
    mockS3Send.mockResolvedValue({
      ContentLength: 123,
      ContentType: 'image/png',
    });
    let capturedUpdateArg: unknown;
    prisma.asset.update.mockImplementation((args: unknown) => {
      capturedUpdateArg = args;
      return Promise.resolve({
        id: 'asset-1',
        publicUrl: 'https://assets.example.com/logo.png',
      });
    });

    const result = await service.completeUpload('user-1', 'asset-1');

    const updateArg = capturedUpdateArg as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(updateArg.where).toEqual({ id: 'asset-1' });
    expect(updateArg.data).toMatchObject({
      status: AssetStatus.READY,
      byteSize: 123,
      contentType: 'image/png',
    });
    expect(result.asset).toEqual({
      id: 'asset-1',
      publicUrl: 'https://assets.example.com/logo.png',
    });
  });

  it('rejects completion when S3 object verification fails', async () => {
    prisma.asset.findFirst.mockResolvedValue({
      id: 'asset-1',
      status: AssetStatus.PENDING,
      bucket: 'cpa-assets',
      region: 'ap-northeast-2',
      key: 'company-logos/company-1/logo.png',
      contentType: 'image/png',
      byteSize: 123,
      publicUrl: 'https://assets.example.com/logo.png',
    });
    mockS3Send.mockRejectedValue(new Error('missing'));

    await expect(
      service.completeUpload('user-1', 'asset-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.asset.update).not.toHaveBeenCalled();
  });
});
