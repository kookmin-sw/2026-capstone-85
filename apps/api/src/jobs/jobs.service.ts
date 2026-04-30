import { Injectable, NotFoundException } from '@nestjs/common';
import { DeadlineType, Job, JobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListJobsDto } from './dto/list-jobs.dto';

const jobInclude = {
  company: true,
  source: true,
  labels: {
    include: {
      label: true,
    },
  },
} satisfies Prisma.JobInclude;

type JobWithRelations = Job &
  Prisma.JobGetPayload<{ include: typeof jobInclude }>;

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListJobsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.JobWhereInput = {
      status: JobStatus.OPEN,
      ...(query.jobFamily && { jobFamily: query.jobFamily }),
      ...(query.companyType && { companyType: query.companyType }),
      ...(query.traineeStatus && { traineeStatus: query.traineeStatus }),
      ...(query.kicpaCondition && { kicpaCondition: query.kicpaCondition }),
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy =
      query.sort === 'latest'
        ? [{ createdAt: 'desc' as const }]
        : [{ deadline: 'asc' as const }, { createdAt: 'desc' as const }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items: items.map((job) => this.toListItem(job)),
      page,
      pageSize,
      total,
    };
  }

  async detail(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        ...jobInclude,
        aiSuggestions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!job) {
      throw new NotFoundException('공고를 찾을 수 없습니다.');
    }

    return {
      ...this.toListItem(job),
      description: job.description,
      practicalTrainingInstitution: job.practicalTrainingInstitution,
      minExperienceYears: job.minExperienceYears,
      maxExperienceYears: job.maxExperienceYears,
      location: job.location,
      aiSuggestion: job.aiSuggestions[0] ?? null,
    };
  }

  private toListItem(job: JobWithRelations) {
    return {
      id: job.id,
      title: job.title,
      companyName: job.company.name,
      companyType: job.companyType,
      jobFamily: job.jobFamily,
      employmentType: job.employmentType,
      kicpaCondition: job.kicpaCondition,
      traineeStatus: job.traineeStatus,
      deadlineType: job.deadlineType,
      deadline: job.deadline?.toISOString() ?? null,
      dDay: this.calculateDDay(job),
      sourceName: job.source.name,
      originalUrl: job.originalUrl,
      lastCheckedAt: job.lastCheckedAt.toISOString(),
      labels: job.labels.map(({ label }) => label.name),
    };
  }

  private calculateDDay(job: Pick<Job, 'deadline' | 'deadlineType'>) {
    if (job.deadlineType !== DeadlineType.FIXED_DATE || !job.deadline) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(job.deadline);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
  }
}
