import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, CompanyType, JobFamily, EmploymentType, KicpaCondition, TraineeStatus, DeadlineType } from "@prisma/client";
import argon2 from "argon2";

const connectionString = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      connectionString ??
      "postgresql://cpa:cpa@localhost:5432/cpa_jobs?schema=public",
  }),
});

async function main() {
  const passwordHash = await argon2.hash("password123");

  const [kicpaSource, saraminSource, big4Source] = await Promise.all([
    prisma.source.upsert({
      where: { name: "KICPA 구인 게시판" },
      update: {},
      create: { name: "KICPA 구인 게시판", baseUrl: "https://www.kicpa.or.kr" },
    }),
    prisma.source.upsert({
      where: { name: "사람인" },
      update: {},
      create: { name: "사람인", baseUrl: "https://www.saramin.co.kr" },
    }),
    prisma.source.upsert({
      where: { name: "Big4 채용 페이지" },
      update: {},
      create: { name: "Big4 채용 페이지" },
    }),
  ]);

  const [traineeLabel, kicpaPreferredLabel, urgentLabel] = await Promise.all([
    prisma.label.upsert({
      where: { name: "수습가능" },
      update: {},
      create: { name: "수습가능", color: "emerald" },
    }),
    prisma.label.upsert({
      where: { name: "KICPA우대" },
      update: {},
      create: { name: "KICPA우대", color: "blue" },
    }),
    prisma.label.upsert({
      where: { name: "마감임박" },
      update: {},
      create: { name: "마감임박", color: "rose" },
    }),
  ]);

  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: "한빛회계법인" },
      update: {},
      create: {
        name: "한빛회계법인",
        type: CompanyType.LOCAL_ACCOUNTING_FIRM,
        websiteUrl: "https://example.com/hanbit",
        tags: ["로컬", "감사"],
      },
    }),
    prisma.company.upsert({
      where: { name: "삼일회계법인" },
      update: {},
      create: {
        name: "삼일회계법인",
        type: CompanyType.BIG4,
        websiteUrl: "https://example.com/samil",
        tags: ["Big4", "신입"],
      },
    }),
    prisma.company.upsert({
      where: { name: "두나무" },
      update: {},
      create: {
        name: "두나무",
        type: CompanyType.GENERAL_COMPANY,
        websiteUrl: "https://example.com/dunamu",
        tags: ["인하우스", "내부회계"],
      },
    }),
  ]);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash, displayName: "관리자", role: UserRole.ADMIN },
  });
  await prisma.user.upsert({
    where: { username: "jobseeker" },
    update: {},
    create: { username: "jobseeker", passwordHash, displayName: "수습 CPA", role: UserRole.JOB_SEEKER },
  });
  await prisma.user.upsert({
    where: { username: "company" },
    update: {},
    create: {
      username: "company",
      passwordHash,
      displayName: "기업 담당자",
      role: UserRole.COMPANY,
      companyId: companies[0].id,
    },
  });

  const jobs = [
    {
      title: "수습 CPA 감사본부 채용",
      description: "수습 CPA 지원 가능. 회계감사 보조와 재무제표 검토 업무를 수행합니다.",
      company: companies[0],
      source: kicpaSource,
      originalUrl: "https://example.com/jobs/hanbit-audit-trainee",
      jobFamily: JobFamily.AUDIT,
      employmentType: EmploymentType.FULL_TIME,
      companyType: CompanyType.LOCAL_ACCOUNTING_FIRM,
      kicpaCondition: KicpaCondition.PREFERRED,
      traineeStatus: TraineeStatus.AVAILABLE,
      deadlineType: DeadlineType.FIXED_DATE,
      deadline: new Date("2026-05-15T14:59:59.000Z"),
      labels: [traineeLabel, kicpaPreferredLabel, urgentLabel],
    },
    {
      title: "Deal Advisory 주니어 회계사",
      description: "FDD, valuation, transaction service 프로젝트를 지원할 주니어 회계사를 채용합니다.",
      company: companies[1],
      source: big4Source,
      originalUrl: "https://example.com/jobs/samil-deal-junior",
      jobFamily: JobFamily.DEAL,
      employmentType: EmploymentType.FULL_TIME,
      companyType: CompanyType.BIG4,
      kicpaCondition: KicpaCondition.REQUIRED,
      traineeStatus: TraineeStatus.UNAVAILABLE,
      deadlineType: DeadlineType.UNTIL_FILLED,
      deadline: null,
      labels: [kicpaPreferredLabel],
    },
    {
      title: "내부회계관리제도 담당자",
      description: "상장사 내부회계 운영 평가, 통제 설계, 외부감사 대응 업무를 담당합니다.",
      company: companies[2],
      source: saraminSource,
      originalUrl: "https://example.com/jobs/dunamu-icfr",
      jobFamily: JobFamily.INTERNAL_ACCOUNTING,
      employmentType: EmploymentType.FULL_TIME,
      companyType: CompanyType.GENERAL_COMPANY,
      kicpaCondition: KicpaCondition.PREFERRED,
      traineeStatus: TraineeStatus.UNCLEAR,
      deadlineType: DeadlineType.FIXED_DATE,
      deadline: new Date("2026-05-31T14:59:59.000Z"),
      labels: [kicpaPreferredLabel],
    },
  ];

  for (const jobData of jobs) {
    const existing = await prisma.job.findFirst({ where: { originalUrl: jobData.originalUrl } });
    if (existing) continue;

    const createdJob = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        companyId: jobData.company.id,
        sourceId: jobData.source.id,
        originalUrl: jobData.originalUrl,
        jobFamily: jobData.jobFamily,
        employmentType: jobData.employmentType,
        companyType: jobData.companyType,
        kicpaCondition: jobData.kicpaCondition,
        traineeStatus: jobData.traineeStatus,
        practicalTrainingInstitution: jobData.traineeStatus === TraineeStatus.AVAILABLE,
        deadlineType: jobData.deadlineType,
        deadline: jobData.deadline,
        lastCheckedAt: new Date(),
      },
    });

    await prisma.jobLabel.createMany({
      data: jobData.labels.map((label) => ({
        jobId: createdJob.id,
        labelId: label.id,
      })),
      skipDuplicates: true,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
