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

type EmployeeTrendPoint = {
  month: string;
  joined: number;
  left: number;
  total: number;
};

function calculateRecentAttritionRate(trend: EmployeeTrendPoint[]) {
  const recent = trend.slice(-3);
  if (!recent.length) return null;
  const leftTotal = recent.reduce((sum, point) => sum + point.left, 0);
  const averageTotal =
    recent.reduce((sum, point) => sum + point.total, 0) / recent.length;
  if (!averageTotal) return null;
  return Number(((leftTotal / averageTotal) * 100).toFixed(1));
}

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

  const companyProfiles = [
    {
      name: "한빛회계법인",
      type: CompanyType.LOCAL_ACCOUNTING_FIRM,
      websiteUrl: "https://example.com/hanbit",
      logoUrl: "/company-logos/hanbit-accounting.png",
      description:
        "중견·성장기업 감사와 세무 자문에 강점을 가진 로컬 회계법인입니다. 수습 회계사가 감사 현장과 재무제표 검토 업무를 빠르게 익힐 수 있는 실무형 조직을 지향합니다.",
      businessNumber: "104-86-45219",
      externalLinks: ["https://example.com/hanbit/careers"],
      tags: ["로컬", "감사"],
      employeeCount: 64,
      averageSalary: 6200,
      foundedYear: 2014,
      employeeTrend: [
        { month: "2025-10", joined: 4, left: 1, total: 58 },
        { month: "2025-11", joined: 2, left: 1, total: 59 },
        { month: "2025-12", joined: 3, left: 0, total: 62 },
        { month: "2026-01", joined: 2, left: 2, total: 62 },
        { month: "2026-02", joined: 5, left: 1, total: 66 },
        { month: "2026-03", joined: 1, left: 3, total: 64 },
      ],
    },
    {
      name: "삼일회계법인",
      type: CompanyType.BIG4,
      websiteUrl: "https://example.com/samil",
      logoUrl: "/company-logos/samil-accounting.png",
      description:
        "감사, 세무, Deal, Risk Advisory를 폭넓게 다루는 대형 회계법인입니다. 산업별 전문 조직과 교육 체계를 바탕으로 주니어 회계사의 프로젝트 경험 축적을 지원합니다.",
      businessNumber: "110-81-34892",
      externalLinks: ["https://example.com/samil/careers"],
      tags: ["Big4", "신입"],
      employeeCount: 3910,
      averageSalary: 7600,
      foundedYear: 1971,
      employeeTrend: [
        { month: "2025-10", joined: 132, left: 42, total: 3820 },
        { month: "2025-11", joined: 88, left: 55, total: 3853 },
        { month: "2025-12", joined: 96, left: 47, total: 3902 },
        { month: "2026-01", joined: 71, left: 63, total: 3910 },
        { month: "2026-02", joined: 54, left: 60, total: 3904 },
        { month: "2026-03", joined: 80, left: 74, total: 3910 },
      ],
    },
    {
      name: "두나무",
      type: CompanyType.GENERAL_COMPANY,
      websiteUrl: "https://example.com/dunamu",
      logoUrl: "/company-logos/dunamu.png",
      description:
        "디지털 자산과 핀테크 서비스를 운영하는 기술 기업입니다. 내부회계관리제도, 재무 리포팅, 통제 설계 영역에서 회계 전문성을 제품 조직과 연결합니다.",
      businessNumber: "120-88-18432",
      externalLinks: ["https://example.com/dunamu/careers"],
      tags: ["인하우스", "내부회계"],
      employeeCount: 720,
      averageSalary: 8800,
      foundedYear: 2012,
      employeeTrend: [
        { month: "2025-10", joined: 24, left: 13, total: 702 },
        { month: "2025-11", joined: 18, left: 9, total: 711 },
        { month: "2025-12", joined: 15, left: 12, total: 714 },
        { month: "2026-01", joined: 21, left: 16, total: 719 },
        { month: "2026-02", joined: 16, left: 18, total: 717 },
        { month: "2026-03", joined: 19, left: 16, total: 720 },
      ],
    },
    {
      name: "서율세무회계",
      type: CompanyType.MID_SMALL_ACCOUNTING_FIRM,
      websiteUrl: "https://example.com/seoyul",
      logoUrl: "/company-logos/seoyul-tax-accounting.png",
      description:
        "스타트업과 개인사업자를 대상으로 세무 기장, 신고, CFO 자문을 제공하는 부티크 세무회계 조직입니다. 공고가 없는 기간에도 상시 인재풀을 운영합니다.",
      businessNumber: "214-90-67351",
      externalLinks: ["https://example.com/seoyul/about"],
      tags: ["세무", "스타트업"],
      employeeCount: 28,
      averageSalary: 5100,
      foundedYear: 2018,
      employeeTrend: [
        { month: "2025-10", joined: 1, left: 0, total: 25 },
        { month: "2025-11", joined: 2, left: 1, total: 26 },
        { month: "2025-12", joined: 0, left: 0, total: 26 },
        { month: "2026-01", joined: 2, left: 0, total: 28 },
        { month: "2026-02", joined: 1, left: 1, total: 28 },
        { month: "2026-03", joined: 1, left: 1, total: 28 },
      ],
    },
    {
      name: "그린인사이트",
      type: CompanyType.FINANCIAL_COMPANY,
      websiteUrl: "https://example.com/greeninsight",
      logoUrl: "/company-logos/green-insight.png",
      description:
        "ESG 데이터와 투자 리서치를 결합한 금융 분석 회사입니다. 회계·재무 데이터 품질 관리와 지속가능성 공시 검토 역량을 중요하게 봅니다.",
      businessNumber: "101-87-92014",
      externalLinks: ["https://example.com/greeninsight/careers"],
      tags: ["금융사", "ESG"],
      employeeCount: 116,
      averageSalary: 6900,
      foundedYear: 2019,
      employeeTrend: [
        { month: "2025-10", joined: 5, left: 2, total: 108 },
        { month: "2025-11", joined: 3, left: 1, total: 110 },
        { month: "2025-12", joined: 4, left: 2, total: 112 },
        { month: "2026-01", joined: 6, left: 3, total: 115 },
        { month: "2026-02", joined: 2, left: 2, total: 115 },
        { month: "2026-03", joined: 4, left: 3, total: 116 },
      ],
    },
  ].map((company) => ({
    ...company,
    recentAttritionRate: calculateRecentAttritionRate(company.employeeTrend),
  }));

  const companies = await Promise.all(
    companyProfiles.map((company) =>
      prisma.company.upsert({
        where: { name: company.name },
        update: company,
        create: company,
      }),
    ),
  );

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
      practicalTrainingInstitution: true,
      minExperienceYears: 0,
      maxExperienceYears: 1,
      location: "서울 중구",
      deadlineType: DeadlineType.FIXED_DATE,
      deadline: new Date("2026-05-08T14:59:59.000Z"),
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
      practicalTrainingInstitution: false,
      minExperienceYears: 1,
      maxExperienceYears: 3,
      location: "서울 영등포구",
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
      practicalTrainingInstitution: false,
      minExperienceYears: 4,
      maxExperienceYears: 8,
      location: "서울 강남구",
      deadlineType: DeadlineType.FIXED_DATE,
      deadline: new Date("2026-05-31T14:59:59.000Z"),
      labels: [kicpaPreferredLabel],
    },
  ];

  for (const jobData of jobs) {
    const existing = await prisma.job.findFirst({ where: { originalUrl: jobData.originalUrl } });
    const jobPayload = {
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
      practicalTrainingInstitution: jobData.practicalTrainingInstitution,
      minExperienceYears: jobData.minExperienceYears,
      maxExperienceYears: jobData.maxExperienceYears,
      location: jobData.location,
      deadlineType: jobData.deadlineType,
      deadline: jobData.deadline,
      lastCheckedAt: new Date(),
    };

    const savedJob = existing
      ? await prisma.job.update({
          where: { id: existing.id },
          data: jobPayload,
        })
      : await prisma.job.create({
      data: {
        ...jobPayload,
      },
    });

    await prisma.jobLabel.deleteMany({ where: { jobId: savedJob.id } });
    await prisma.jobLabel.createMany({
      data: jobData.labels.map((label) => ({
        jobId: savedJob.id,
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
