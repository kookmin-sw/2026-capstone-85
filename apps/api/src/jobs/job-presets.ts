import { JobStatus, type Prisma } from '@prisma/client';
import type {
  CareerVerificationSignal,
  JobPresetConfig,
  JobPresetId,
} from '@cpa/shared';
import { PrismaService } from '../prisma/prisma.service';

export const jobPresetConfigs = [
  {
    id: 'active-hiring',
    label: '적극 채용 중',
    description: '회사 단위로 활성 공고가 많은 채용 신호를 봅니다.',
    resolver: 'company-open-job-count',
    criteria: { minOpenJobs: 5 },
  },
  {
    id: 'career-verified',
    label: '커리어 검증 기업',
    description: '명시된 회사 metadata로 설명 가능한 기업만 봅니다.',
    resolver: 'company-career-verification',
    criteria: {
      signals: [
        'BIG4',
        'PUBLIC_INSTITUTION',
        'MAJOR_ACCOUNTING_FIRM',
        'LISTED',
        'CONGLOMERATE',
        'PUBLIC_EQUIVALENT',
      ],
    },
  },
] as const satisfies readonly JobPresetConfig[];

export async function buildJobPresetWhere(
  prisma: PrismaService,
  preset: JobPresetId | undefined,
): Promise<Prisma.JobWhereInput | null> {
  if (!preset) return null;
  const config = jobPresetConfigs.find((item) => item.id === preset);
  if (!config) return null;

  if (config.resolver === 'company-open-job-count') {
    const rows = await prisma.job.groupBy({
      by: ['companyId'],
      where: { status: JobStatus.OPEN },
      _count: { _all: true },
    });
    const companyIds = rows
      .filter((row) => row._count._all >= config.criteria.minOpenJobs)
      .map((row) => row.companyId);
    return { companyId: { in: companyIds } };
  }

  return buildCareerVerifiedWhere(prisma, config.criteria.signals);
}

async function buildCareerVerifiedWhere(
  prisma: PrismaService,
  signals: readonly CareerVerificationSignal[],
): Promise<Prisma.JobWhereInput> {
  const rows = await prisma.companyMetadata.findMany({
    where: {
      careerVerificationSignals: { hasSome: [...signals] },
    },
    select: { companyId: true },
  });

  return { companyId: { in: rows.map((row) => row.companyId) } };
}
