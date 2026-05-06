import { ConflictException } from '@nestjs/common';
import {
  CompanyType,
  DeadlineType,
  EmploymentType,
  JobFamily,
  JobStatus,
  KicpaCondition,
  SubmissionStatus,
  SubmissionType,
  TraineeStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService review flows', () => {
  let tx: {
    jobSubmission: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    source: {
      upsert: jest.Mock;
    };
    job: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    company: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    companyProfileSubmission: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let prisma: {
    $transaction: jest.Mock;
    companyProfileSubmission: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let service: AdminService;

  beforeEach(() => {
    tx = {
      jobSubmission: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      source: {
        upsert: jest.fn(),
      },
      job: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      company: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      companyProfileSubmission: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
      companyProfileSubmission: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new AdminService(prisma as unknown as PrismaService);
  });

  it('approves a pending job submission by creating a public job', async () => {
    const createdAt = new Date('2026-05-06T00:00:00.000Z');
    const submission = {
      id: 'submission-1',
      companyId: 'company-1',
      company: {
        id: 'company-1',
        name: '테스트회계법인',
        type: CompanyType.LOCAL_ACCOUNTING_FIRM,
      },
      submittedBy: { username: 'company-user' },
      reviewedBy: null,
      targetJob: null,
      submissionType: SubmissionType.CREATE,
      targetJobId: null,
      title: '감사 공고',
      description: '설명',
      originalUrl: 'https://example.com/job',
      jobFamily: JobFamily.AUDIT,
      employmentType: EmploymentType.FULL_TIME,
      kicpaCondition: KicpaCondition.PREFERRED,
      traineeStatus: TraineeStatus.AVAILABLE,
      practicalTrainingInstitution: true,
      minExperienceYears: 0,
      maxExperienceYears: 1,
      location: '서울',
      deadlineType: DeadlineType.UNTIL_FILLED,
      deadline: null,
      status: SubmissionStatus.PENDING,
      adminNote: null,
      approvedJobId: null,
      createdAt,
      updatedAt: createdAt,
      reviewedAt: null,
    };
    tx.jobSubmission.findUnique.mockResolvedValue(submission);
    tx.source.upsert.mockResolvedValue({ id: 'source-1' });
    let capturedJobCreateArg: unknown;
    let capturedSubmissionUpdateArg: unknown;
    tx.job.create.mockImplementation((args: unknown) => {
      capturedJobCreateArg = args;
      return Promise.resolve({ id: 'job-1' });
    });
    tx.jobSubmission.update.mockImplementation((args: unknown) => {
      capturedSubmissionUpdateArg = args;
      return Promise.resolve({
        ...submission,
        status: SubmissionStatus.APPROVED,
        adminNote: '확인',
        approvedJobId: 'job-1',
        reviewedBy: { username: 'admin' },
        reviewedAt: createdAt,
        updatedAt: createdAt,
      });
    });

    const result = await service.approveJobSubmission(
      'submission-1',
      'admin-1',
      '확인',
    );

    expect(tx.source.upsert).toHaveBeenCalledWith({
      where: { name: '기업회원 제출' },
      update: {},
      create: {
        name: '기업회원 제출',
        description: '기업회원이 제출하고 관리자가 승인한 채용공고',
      },
    });
    const jobCreateArg = capturedJobCreateArg as {
      data: {
        companyId: string;
        sourceId: string;
        companyType: CompanyType;
        originalUrl: string;
      };
    };
    expect(jobCreateArg.data).toMatchObject({
      companyId: 'company-1',
      sourceId: 'source-1',
      companyType: CompanyType.LOCAL_ACCOUNTING_FIRM,
      originalUrl: 'https://example.com/job',
    });
    const updateArg = capturedSubmissionUpdateArg as {
      data: {
        status: SubmissionStatus;
        approvedJobId: string;
        reviewedById: string;
      };
    };
    expect(updateArg.data).toMatchObject({
      status: SubmissionStatus.APPROVED,
      approvedJobId: 'job-1',
      reviewedById: 'admin-1',
    });
    expect(result.approvedJobId).toBe('job-1');
  });

  it('rejects already processed job submissions', async () => {
    tx.jobSubmission.findUnique.mockResolvedValue({
      status: SubmissionStatus.APPROVED,
    });

    await expect(
      service.approveJobSubmission('submission-1', 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.job.create).not.toHaveBeenCalled();
  });

  it('approves a pending update submission by updating the target job', async () => {
    const createdAt = new Date('2026-05-06T00:00:00.000Z');
    const submission = {
      id: 'submission-update-1',
      companyId: 'company-1',
      company: {
        id: 'company-1',
        name: '테스트회계법인',
        type: CompanyType.LOCAL_ACCOUNTING_FIRM,
      },
      submittedBy: { username: 'company-user' },
      reviewedBy: null,
      targetJob: { id: 'job-1', title: '기존 공고' },
      submissionType: SubmissionType.UPDATE,
      targetJobId: 'job-1',
      title: '수정 공고',
      description: '수정 설명',
      originalUrl: 'https://example.com/job-updated',
      jobFamily: JobFamily.TAX,
      employmentType: EmploymentType.FULL_TIME,
      kicpaCondition: KicpaCondition.REQUIRED,
      traineeStatus: TraineeStatus.AVAILABLE,
      practicalTrainingInstitution: true,
      minExperienceYears: 1,
      maxExperienceYears: 3,
      location: '서울',
      deadlineType: DeadlineType.UNTIL_FILLED,
      deadline: null,
      status: SubmissionStatus.PENDING,
      adminNote: null,
      approvedJobId: null,
      createdAt,
      updatedAt: createdAt,
      reviewedAt: null,
    };
    tx.jobSubmission.findUnique.mockResolvedValue(submission);
    tx.job.findFirst.mockResolvedValue({ id: 'job-1' });
    let capturedJobUpdateArg: unknown;
    tx.job.update.mockImplementation((args: unknown) => {
      capturedJobUpdateArg = args;
      return Promise.resolve({ id: 'job-1' });
    });
    tx.jobSubmission.update.mockResolvedValue({
      ...submission,
      status: SubmissionStatus.APPROVED,
      reviewedBy: { username: 'admin' },
      reviewedAt: createdAt,
      updatedAt: createdAt,
    });

    await service.approveJobSubmission(
      'submission-update-1',
      'admin-1',
      '확인',
    );

    expect(tx.source.upsert).not.toHaveBeenCalled();
    expect(tx.job.create).not.toHaveBeenCalled();
    expect(tx.job.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'job-1',
        companyId: 'company-1',
        status: JobStatus.OPEN,
      },
      select: { id: true },
    });
    const updateArg = capturedJobUpdateArg as {
      where: { id: string };
      data: {
        title: string;
        description: string;
        originalUrl: string;
        companyType: CompanyType;
      };
    };
    expect(updateArg).toMatchObject({
      where: { id: 'job-1' },
      data: {
        title: '수정 공고',
        description: '수정 설명',
        originalUrl: 'https://example.com/job-updated',
        companyType: CompanyType.LOCAL_ACCOUNTING_FIRM,
      },
    });
  });

  it('rejects a profile submission without updating the public company', async () => {
    const createdAt = new Date('2026-05-06T00:00:00.000Z');
    const reviewed = {
      id: 'profile-1',
      companyId: 'company-1',
      company: { id: 'company-1', name: '테스트회계법인' },
      submittedBy: { username: 'company-user' },
      reviewedBy: { username: 'admin' },
      proposed: { name: '새 회사명' },
      status: SubmissionStatus.REJECTED,
      adminNote: '보류',
      createdAt,
      updatedAt: createdAt,
      reviewedAt: createdAt,
    };
    prisma.companyProfileSubmission.findUnique.mockResolvedValue({
      status: SubmissionStatus.PENDING,
    });
    prisma.companyProfileSubmission.update.mockResolvedValue(reviewed);

    await service.rejectProfileSubmission('profile-1', 'admin-1', '보류');

    expect(tx.company.update).not.toHaveBeenCalled();
  });
});
