import type { EmployeeTrendPoint } from '@cpa/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeadlineType, Job, JobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListCompaniesDto } from './dto/list-companies.dto';

const companyListInclude = {
  jobs: {
    where: { status: JobStatus.OPEN },
    select: { id: true },
  },
} satisfies Prisma.CompanyInclude;

const jobInclude = {
  company: true,
  source: true,
  labels: {
    include: {
      label: true,
    },
  },
} satisfies Prisma.JobInclude;

const companyDetailInclude = {
  jobs: {
    where: { status: JobStatus.OPEN },
    include: jobInclude,
    orderBy: [{ deadline: 'asc' as const }, { createdAt: 'desc' as const }],
  },
} satisfies Prisma.CompanyInclude;

type CompanyListRecord = Prisma.CompanyGetPayload<{
  include: typeof companyListInclude;
}>;

type CompanyDetailRecord = Prisma.CompanyGetPayload<{
  include: typeof companyDetailInclude;
}>;

type JobWithRelations = Job &
  Prisma.JobGetPayload<{ include: typeof jobInclude }>;

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCompaniesDto) {
    const where = this.buildWhere(query);

    const [companies, total, openTotal, noJobTotal] =
      await this.prisma.$transaction([
        this.prisma.company.findMany({
          where,
          include: companyListInclude,
          orderBy: this.buildOrderBy(query.sort),
        }),
        this.prisma.company.count({ where }),
        this.prisma.company.count({
          where: {
            ...where,
            jobs: { some: { status: JobStatus.OPEN } },
          },
        }),
        this.prisma.company.count({
          where: {
            ...where,
            jobs: { none: { status: JobStatus.OPEN } },
          },
        }),
      ]);

    return {
      items: companies.map((company) => this.toListItem(company)),
      total,
      openTotal,
      noJobTotal,
    };
  }

  async detail(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: companyDetailInclude,
    });

    if (!company) {
      throw new NotFoundException('회사를 찾을 수 없습니다.');
    }

    return {
      ...this.toListItem(company),
      businessNumber: company.businessNumber,
      externalLinks: company.externalLinks,
      employeeTrend: this.toEmployeeTrend(company.employeeTrend),
      openJobs: company.jobs.map((job) => this.toJobListItem(job)),
    };
  }

  private toListItem(company: CompanyListRecord | CompanyDetailRecord) {
    return {
      id: company.id,
      name: company.name,
      type: company.type,
      websiteUrl: company.websiteUrl,
      logoUrl: company.logoUrl,
      description: company.description,
      tags: company.tags,
      employeeCount: company.employeeCount,
      averageSalary: company.averageSalary,
      foundedYear: company.foundedYear,
      recentAttritionRate: company.recentAttritionRate,
      openJobCount: company.jobs.length,
    };
  }

  private buildWhere(query: ListCompaniesDto): Prisma.CompanyWhereInput {
    const where: Prisma.CompanyWhereInput = {};
    const and: Prisma.CompanyWhereInput[] = [
      ...(query.companyType ? [{ type: query.companyType }] : []),
      ...(query.tag ? [{ tags: { has: query.tag } }] : []),
      ...(query.hasOpenJobs === true
        ? [{ jobs: { some: { status: JobStatus.OPEN } } }]
        : []),
      ...(query.hasOpenJobs === false
        ? [{ jobs: { none: { status: JobStatus.OPEN } } }]
        : []),
    ];

    const search = query.search?.trim();
    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      });
    }

    if (
      query.minEmployeeCount !== undefined ||
      query.maxEmployeeCount !== undefined
    ) {
      and.push({
        employeeCount: {
          ...(query.minEmployeeCount !== undefined && {
            gte: query.minEmployeeCount,
          }),
          ...(query.maxEmployeeCount !== undefined && {
            lte: query.maxEmployeeCount,
          }),
        },
      });
    }

    if (
      query.minAverageSalary !== undefined ||
      query.maxAverageSalary !== undefined
    ) {
      and.push({
        averageSalary: {
          ...(query.minAverageSalary !== undefined && {
            gte: query.minAverageSalary,
          }),
          ...(query.maxAverageSalary !== undefined && {
            lte: query.maxAverageSalary,
          }),
        },
      });
    }

    if (
      query.minCompanyAgeYears !== undefined ||
      query.maxCompanyAgeYears !== undefined
    ) {
      const currentYear = new Date().getFullYear();
      and.push({
        foundedYear: {
          ...(query.minCompanyAgeYears !== undefined && {
            lte: currentYear - query.minCompanyAgeYears + 1,
          }),
          ...(query.maxCompanyAgeYears !== undefined && {
            gte: currentYear - query.maxCompanyAgeYears + 1,
          }),
        },
      });
    }

    if (query.maxAttritionRate !== undefined) {
      and.push({ recentAttritionRate: { lte: query.maxAttritionRate } });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    return where;
  }

  private buildOrderBy(sort: ListCompaniesDto['sort']) {
    if (sort === 'employeeCountDesc') {
      return [{ employeeCount: 'desc' as const }, { name: 'asc' as const }];
    }
    if (sort === 'averageSalaryDesc') {
      return [{ averageSalary: 'desc' as const }, { name: 'asc' as const }];
    }
    if (sort === 'companyAgeDesc') {
      return [{ foundedYear: 'asc' as const }, { name: 'asc' as const }];
    }
    return [{ name: 'asc' as const }];
  }

  private toJobListItem(job: JobWithRelations) {
    return {
      id: job.id,
      title: job.title,
      companyId: job.companyId,
      companyName: job.company.name,
      companyLogoUrl: job.company.logoUrl,
      companyType: job.companyType,
      jobFamily: job.jobFamily,
      employmentType: job.employmentType,
      kicpaCondition: job.kicpaCondition,
      traineeStatus: job.traineeStatus,
      practicalTrainingInstitution: job.practicalTrainingInstitution,
      minExperienceYears: job.minExperienceYears,
      maxExperienceYears: job.maxExperienceYears,
      location: job.location,
      deadlineType: job.deadlineType,
      deadline: job.deadline?.toISOString() ?? null,
      dDay: this.calculateDDay(job),
      sourceName: job.source.name,
      originalUrl: job.originalUrl,
      createdAt: job.createdAt.toISOString(),
      lastCheckedAt: job.lastCheckedAt.toISOString(),
      labels: job.labels.map(({ label }) => label.name),
    };
  }

  private toEmployeeTrend(
    value: Prisma.JsonValue | null,
  ): EmployeeTrendPoint[] {
    if (!Array.isArray(value)) return [];

    return value
      .map((point) => {
        if (
          !point ||
          typeof point !== 'object' ||
          Array.isArray(point) ||
          typeof point.month !== 'string' ||
          typeof point.joined !== 'number' ||
          typeof point.left !== 'number' ||
          typeof point.total !== 'number'
        ) {
          return null;
        }

        return {
          month: point.month,
          joined: point.joined,
          left: point.left,
          total: point.total,
        };
      })
      .filter((point): point is EmployeeTrendPoint => point !== null);
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
