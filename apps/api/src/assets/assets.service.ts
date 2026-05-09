import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetPurpose, AssetStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyLogoUploadUrlDto } from './dto/create-company-logo-upload-url.dto';
import {
  COMPANY_LOGO_EXTENSIONS,
  COMPANY_LOGO_MAX_BYTES,
} from './logo-asset.constants';

const DEFAULT_PRESIGN_EXPIRES_SECONDS = 300;

@Injectable()
export class AssetsService implements OnModuleInit {
  private readonly s3Clients = new Map<string, S3Client>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      this.getS3Config();
    }
  }

  async createCompanyLogoUploadUrl(
    userId: string,
    dto: CreateCompanyLogoUploadUrlDto,
  ) {
    const company = await this.getOwnedCompanyOrThrow(userId);
    const s3Config = this.getS3Config();
    const extension = COMPANY_LOGO_EXTENSIONS.get(dto.contentType);

    if (!extension) {
      throw new BadRequestException(
        '기업 이미지는 PNG, JPG, WEBP, GIF 파일만 업로드할 수 있습니다.',
      );
    }
    if (dto.byteSize > COMPANY_LOGO_MAX_BYTES) {
      throw new BadRequestException(
        '기업 이미지는 2MB 이하로 업로드해 주세요.',
      );
    }

    const key = [
      'company-logos',
      company.id,
      `${Date.now()}-${randomUUID()}.${extension}`,
    ].join('/');
    const publicUrl = this.buildPublicUrl(s3Config.publicBaseUrl, key);
    const asset = await this.prisma.asset.create({
      data: {
        purpose: AssetPurpose.COMPANY_LOGO,
        status: AssetStatus.PENDING,
        bucket: s3Config.bucket,
        region: s3Config.region,
        key,
        publicUrl,
        contentType: dto.contentType,
        byteSize: dto.byteSize,
        originalName: this.normalizeOriginalName(dto.fileName),
        uploadedById: userId,
        companyId: company.id,
      },
    });

    const uploadUrl = await getSignedUrl(
      this.getS3Client(s3Config.region),
      new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        ContentType: dto.contentType,
      }),
      { expiresIn: s3Config.expiresIn },
    );

    return {
      assetId: asset.id,
      uploadUrl,
      method: 'PUT' as const,
      headers: { 'Content-Type': dto.contentType },
      publicUrl,
      expiresIn: s3Config.expiresIn,
    };
  }

  async completeUpload(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: assetId,
        uploadedById: userId,
        purpose: AssetPurpose.COMPANY_LOGO,
      },
    });

    if (!asset) {
      throw new NotFoundException('업로드 자산을 찾을 수 없습니다.');
    }
    if (asset.status === AssetStatus.READY) {
      return { asset: this.toAssetResponse(asset) };
    }

    const head = await this.headObject(asset.bucket, asset.region, asset.key);
    this.assertUploadedObjectMatches(asset, head);

    const updated = await this.prisma.asset.update({
      where: { id: asset.id },
      data: {
        status: AssetStatus.READY,
        byteSize: head.ContentLength ?? asset.byteSize,
        contentType: head.ContentType ?? asset.contentType,
        completedAt: new Date(),
      },
    });

    return { asset: this.toAssetResponse(updated) };
  }

  private async headObject(bucket: string, region: string, key: string) {
    try {
      return await this.getS3Client(region).send(
        new HeadObjectCommand({ Bucket: bucket, Key: key }),
      );
    } catch {
      throw new BadRequestException(
        'S3 업로드가 확인되지 않았습니다. 파일 업로드 후 다시 시도해 주세요.',
      );
    }
  }

  private assertUploadedObjectMatches(
    asset: { byteSize: number; contentType: string },
    head: HeadObjectCommandOutput,
  ) {
    if (!head.ContentLength || head.ContentLength <= 0) {
      throw new BadRequestException(
        '업로드된 기업 이미지 크기를 확인할 수 없습니다.',
      );
    }
    if (head.ContentLength > COMPANY_LOGO_MAX_BYTES) {
      throw new BadRequestException(
        '기업 이미지는 2MB 이하로 업로드해 주세요.',
      );
    }
    if (head.ContentLength !== asset.byteSize) {
      throw new BadRequestException(
        '업로드된 기업 이미지 크기가 요청과 다릅니다.',
      );
    }
    if (head.ContentType !== asset.contentType) {
      throw new BadRequestException(
        '업로드된 기업 이미지 형식이 요청과 다릅니다.',
      );
    }
  }

  private async getOwnedCompanyOrThrow(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!company) {
      throw new ForbiddenException('기업회원 회사 정보를 찾을 수 없습니다.');
    }
    return company;
  }

  private getS3Config() {
    const region = this.config.get<string>('AWS_REGION')?.trim();
    const bucket = this.config.get<string>('S3_ASSET_BUCKET')?.trim();
    const publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL')?.trim();
    const expiresIn = this.parseExpiresIn(
      this.config.get<string>('S3_PRESIGN_EXPIRES_SECONDS'),
    );

    if (!region || !bucket || !publicBaseUrl) {
      throw new InternalServerErrorException(
        'S3 업로드 환경 변수가 설정되지 않았습니다.',
      );
    }

    return { region, bucket, publicBaseUrl, expiresIn };
  }

  private getS3Client(region: string) {
    const existing = this.s3Clients.get(region);
    if (existing) return existing;

    const client = new S3Client({ region });
    this.s3Clients.set(region, client);
    return client;
  }

  private parseExpiresIn(value: string | undefined) {
    const parsed = Number(value ?? DEFAULT_PRESIGN_EXPIRES_SECONDS);
    if (!Number.isFinite(parsed)) return DEFAULT_PRESIGN_EXPIRES_SECONDS;
    return Math.min(Math.max(Math.floor(parsed), 60), 900);
  }

  private buildPublicUrl(publicBaseUrl: string, key: string) {
    const base = publicBaseUrl.replace(/\/+$/, '');
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    return `${base}/${encodedKey}`;
  }

  private normalizeOriginalName(fileName: string) {
    const trimmed = fileName.trim();
    return trimmed ? trimmed.slice(0, 180) : null;
  }

  private toAssetResponse(asset: { id: string; publicUrl: string }) {
    return {
      id: asset.id,
      publicUrl: asset.publicUrl,
    };
  }
}
