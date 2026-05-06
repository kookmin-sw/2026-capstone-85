import type { CompanyProfileProposal } from '@cpa/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  JobStatus,
  Prisma,
  SubmissionStatus,
  SubmissionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const jobSubmissionInclude = {
  company: { select: { id: true, name: true, type: true } },
  submittedBy: { select: { username: true } },
  reviewedBy: { select: { username: true } },
  targetJob: { select: { id: true, title: true } },
} satisfies Prisma.JobSubmissionInclude;

const profileSubmissionInclude = {
  company: { select: { id: true, name: true } },
  submittedBy: { select: { username: true } },
  reviewedBy: { select: { username: true } },
} satisfies Prisma.CompanyProfileSubmissionInclude;

type JobSubmissionRecord = Prisma.JobSubmissionGetPayload<{
  include: typeof jobSubmissionInclude;
}>;

type ProfileSubmissionRecord = Prisma.CompanyProfileSubmissionGetPayload<{
  include: typeof profileSubmissionInclude;
}>;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobSubmissions() {
    const items = await this.prisma.jobSubmission.findMany({
      include: jobSubmissionInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return { items: items.map((item) => this.toJobSubmissionItem(item)) };
  }

  async approveJobSubmission(
    id: string,
    adminUserId: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.jobSubmission.findUnique({
        where: { id },
        include: jobSubmissionInclude,
      });
      if (!submission) {
        throw new NotFoundException('공고 제출을 찾을 수 없습니다.');
      }
      this.assertPending(submission.status);
      if (!submission.originalUrl) {
        throw new BadRequestException(
          '원문 링크가 있는 공고만 승인할 수 있습니다.',
        );
      }

      if (submission.submissionType === SubmissionType.UPDATE) {
        if (!submission.targetJobId) {
          throw new BadRequestException('수정 대상 공고가 필요합니다.');
        }

        const targetJob = await tx.job.findFirst({
          where: {
            id: submission.targetJobId,
            companyId: submission.companyId,
            status: JobStatus.OPEN,
          },
          select: { id: true },
        });
        if (!targetJob) {
          throw new ConflictException('수정 대상 공고가 공개 상태가 아닙니다.');
        }

        await tx.job.update({
          where: { id: targetJob.id },
          data: {
            title: submission.title,
            description: submission.description,
            originalUrl: submission.originalUrl,
            jobFamily: submission.jobFamily,
            employmentType: submission.employmentType,
            companyType: submission.company.type,
            kicpaCondition: submission.kicpaCondition,
            traineeStatus: submission.traineeStatus,
            practicalTrainingInstitution:
              submission.practicalTrainingInstitution,
            minExperienceYears: submission.minExperienceYears,
            maxExperienceYears: submission.maxExperienceYears,
            location: submission.location,
            deadlineType: submission.deadlineType,
            deadline: submission.deadline,
            lastCheckedAt: new Date(),
          },
        });

        const reviewed = await tx.jobSubmission.update({
          where: { id },
          data: {
            status: SubmissionStatus.APPROVED,
            adminNote: this.optionalTrimmed(adminNote),
            reviewedById: adminUserId,
            reviewedAt: new Date(),
          },
          include: jobSubmissionInclude,
        });

        return this.toJobSubmissionItem(reviewed);
      }

      const source = await tx.source.upsert({
        where: { name: '기업회원 제출' },
        update: {},
        create: {
          name: '기업회원 제출',
          description: '기업회원이 제출하고 관리자가 승인한 채용공고',
        },
      });

      const job = await tx.job.create({
        data: {
          title: submission.title,
          description: submission.description,
          companyId: submission.companyId,
          sourceId: source.id,
          originalUrl: submission.originalUrl,
          jobFamily: submission.jobFamily,
          employmentType: submission.employmentType,
          companyType: submission.company.type,
          kicpaCondition: submission.kicpaCondition,
          traineeStatus: submission.traineeStatus,
          practicalTrainingInstitution: submission.practicalTrainingInstitution,
          minExperienceYears: submission.minExperienceYears,
          maxExperienceYears: submission.maxExperienceYears,
          location: submission.location,
          deadlineType: submission.deadlineType,
          deadline: submission.deadline,
          status: JobStatus.OPEN,
          lastCheckedAt: new Date(),
        },
      });

      const reviewed = await tx.jobSubmission.update({
        where: { id },
        data: {
          status: SubmissionStatus.APPROVED,
          adminNote: this.optionalTrimmed(adminNote),
          approvedJobId: job.id,
          reviewedById: adminUserId,
          reviewedAt: new Date(),
        },
        include: jobSubmissionInclude,
      });

      return this.toJobSubmissionItem(reviewed);
    });
  }

  async rejectJobSubmission(
    id: string,
    adminUserId: string,
    adminNote?: string,
  ) {
    const submission = await this.prisma.jobSubmission.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!submission) {
      throw new NotFoundException('공고 제출을 찾을 수 없습니다.');
    }
    this.assertPending(submission.status);

    const reviewed = await this.prisma.jobSubmission.update({
      where: { id },
      data: {
        status: SubmissionStatus.REJECTED,
        adminNote: this.optionalTrimmed(adminNote),
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      },
      include: jobSubmissionInclude,
    });

    return this.toJobSubmissionItem(reviewed);
  }

  async listProfileSubmissions() {
    const items = await this.prisma.companyProfileSubmission.findMany({
      include: profileSubmissionInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return { items: items.map((item) => this.toProfileSubmissionItem(item)) };
  }

  async approveProfileSubmission(
    id: string,
    adminUserId: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.companyProfileSubmission.findUnique({
        where: { id },
        include: profileSubmissionInclude,
      });
      if (!submission) {
        throw new NotFoundException('회사 정보 수정 요청을 찾을 수 없습니다.');
      }
      this.assertPending(submission.status);

      const proposed = this.toCompanyProfileProposal(submission.proposed);
      if (proposed.name) {
        const duplicate = await tx.company.findFirst({
          where: {
            name: proposed.name,
            id: { not: submission.companyId },
          },
          select: { id: true },
        });
        if (duplicate) {
          throw new ConflictException('이미 등록된 회사명입니다.');
        }
      }

      await tx.company.update({
        where: { id: submission.companyId },
        data: this.toCompanyUpdateData(proposed),
      });

      const reviewed = await tx.companyProfileSubmission.update({
        where: { id },
        data: {
          status: SubmissionStatus.APPROVED,
          adminNote: this.optionalTrimmed(adminNote),
          reviewedById: adminUserId,
          reviewedAt: new Date(),
        },
        include: profileSubmissionInclude,
      });

      return this.toProfileSubmissionItem(reviewed);
    });
  }

  async rejectProfileSubmission(
    id: string,
    adminUserId: string,
    adminNote?: string,
  ) {
    const submission = await this.prisma.companyProfileSubmission.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!submission) {
      throw new NotFoundException('회사 정보 수정 요청을 찾을 수 없습니다.');
    }
    this.assertPending(submission.status);

    const reviewed = await this.prisma.companyProfileSubmission.update({
      where: { id },
      data: {
        status: SubmissionStatus.REJECTED,
        adminNote: this.optionalTrimmed(adminNote),
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      },
      include: profileSubmissionInclude,
    });

    return this.toProfileSubmissionItem(reviewed);
  }

  private assertPending(status: SubmissionStatus) {
    if (status !== SubmissionStatus.PENDING) {
      throw new ConflictException('이미 처리된 제출입니다.');
    }
  }

  private toCompanyUpdateData(proposed: CompanyProfileProposal) {
    const data: Prisma.CompanyUpdateInput = {};
    if (proposed.name !== undefined) data.name = proposed.name;
    if (proposed.type !== undefined) data.type = proposed.type;
    if (proposed.websiteUrl !== undefined)
      data.websiteUrl = proposed.websiteUrl;
    if (proposed.logoUrl !== undefined) data.logoUrl = proposed.logoUrl;
    if (proposed.description !== undefined) {
      data.description = proposed.description;
    }
    if (proposed.businessNumber !== undefined) {
      data.businessNumber = proposed.businessNumber;
    }
    if (proposed.externalLinks !== undefined) {
      data.externalLinks = proposed.externalLinks;
    }
    if (proposed.tags !== undefined) data.tags = proposed.tags;
    return data;
  }

  private toCompanyProfileProposal(value: Prisma.JsonValue) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const input = value as Record<string, unknown>;
    const proposal: CompanyProfileProposal = {};
    if (typeof input.name === 'string') proposal.name = input.name;
    if (typeof input.type === 'string') {
      proposal.type = input.type as CompanyProfileProposal['type'];
    }
    for (const key of [
      'websiteUrl',
      'logoUrl',
      'description',
      'businessNumber',
    ] as const) {
      const raw = input[key];
      if (typeof raw === 'string' || raw === null) {
        proposal[key] = raw;
      }
    }
    if (Array.isArray(input.externalLinks)) {
      proposal.externalLinks = input.externalLinks.filter(
        (item): item is string => typeof item === 'string',
      );
    }
    if (Array.isArray(input.tags)) {
      proposal.tags = input.tags.filter(
        (item): item is string => typeof item === 'string',
      );
    }
    return proposal;
  }

  private toJobSubmissionItem(submission: JobSubmissionRecord) {
    return {
      id: submission.id,
      companyId: submission.companyId,
      companyName: submission.company.name,
      title: submission.title,
      description: submission.description,
      originalUrl: submission.originalUrl,
      jobFamily: submission.jobFamily,
      employmentType: submission.employmentType,
      kicpaCondition: submission.kicpaCondition,
      traineeStatus: submission.traineeStatus,
      practicalTrainingInstitution: submission.practicalTrainingInstitution,
      minExperienceYears: submission.minExperienceYears,
      maxExperienceYears: submission.maxExperienceYears,
      location: submission.location,
      deadlineType: submission.deadlineType,
      deadline: submission.deadline?.toISOString() ?? null,
      status: submission.status,
      adminNote: submission.adminNote,
      approvedJobId: submission.approvedJobId,
      submissionType: submission.submissionType,
      targetJobId: submission.targetJobId,
      targetJobTitle: submission.targetJob?.title ?? null,
      submittedByUsername: submission.submittedBy.username,
      reviewedByUsername: submission.reviewedBy?.username ?? null,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    };
  }

  private toProfileSubmissionItem(submission: ProfileSubmissionRecord) {
    return {
      id: submission.id,
      companyId: submission.companyId,
      companyName: submission.company.name,
      proposed: this.toCompanyProfileProposal(submission.proposed),
      status: submission.status,
      adminNote: submission.adminNote,
      submittedByUsername: submission.submittedBy.username,
      reviewedByUsername: submission.reviewedBy?.username ?? null,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    };
  }

  private optionalTrimmed(value: string | undefined) {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
}
