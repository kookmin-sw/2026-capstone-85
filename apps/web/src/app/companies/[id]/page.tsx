"use client";

import type { CompanyDetailItem, JobListItem } from "@cpa/shared";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Globe2,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { fetchCompanyDetail } from "@/lib/api";
import {
  companyTypeLabels,
  deadlineTypeLabels,
  jobFamilyLabels,
  traineeLabels,
} from "@/lib/labels";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [company, setCompany] = useState<CompanyDetailItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchCompanyDetail(id)
      .then((data) => {
        if (!ignore) {
          setCompany(data);
          setError("");
        }
      })
      .catch((caught: Error) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-8">
        <div className="mx-auto max-w-6xl border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
          회사 상세를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-8">
        <div className="mx-auto max-w-6xl border border-red-200 bg-red-50 p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-700"
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-red-900">
            회사를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error || "요청한 회사가 없거나 아직 공개되지 않았습니다."}
          </p>
        </div>
      </main>
    );
  }

  return <CompanyDetail company={company} />;
}

function CompanyDetail({ company }: { company: CompanyDetailItem }) {
  const maxTotal = useMemo(() => {
    return Math.max(1, ...company.employeeTrend.map((point) => point.total));
  }, [company.employeeTrend]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--app-line)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)]"
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </Link>

          <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr_auto] lg:items-start">
            <CompanyLogo
              name={company.name}
              logoUrl={company.logoUrl}
              size="lg"
            />

            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="teal">{companyTypeLabels[company.type]}</Badge>
                <Badge>
                  {company.openJobCount > 0
                    ? `채용 중 ${company.openJobCount}건`
                    : "현재 공고 없음"}
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-normal">
                {company.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-muted)]">
                {company.description ?? "회사 소개가 준비 중입니다."}
              </p>
            </div>

            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
              >
                홈페이지
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 size={18} />
              회사 정보
            </h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <Info label="업력" value={formatCompanyAge(company.foundedYear)} />
              <Info
                label="직원수"
                value={
                  company.employeeCount
                    ? `${company.employeeCount.toLocaleString("ko-KR")}명`
                    : "미공개"
                }
              />
              <Info
                label="평균연봉"
                value={formatSalary(company.averageSalary)}
              />
              <Info
                label="최근 퇴사율"
                value={formatRate(company.recentAttritionRate)}
              />
              <Info
                label="사업자번호"
                value={company.businessNumber ?? "미공개"}
              />
              <Info
                label="회사 유형"
                value={companyTypeLabels[company.type]}
              />
              <Info
                label="홈페이지"
                value={company.websiteUrl ? "연결 가능" : "미공개"}
              />
            </div>
          </section>

          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp size={18} />
              직원수 추이
            </h2>
            <div className="mt-4 grid gap-3">
              {company.employeeTrend.length ? (
                company.employeeTrend.map((point) => (
                  <div
                    key={point.month}
                    className="grid gap-3 border border-[var(--app-line)] bg-[#fbfbf8] p-3 text-sm md:grid-cols-[88px_1fr_190px]"
                  >
                    <p className="font-semibold">{point.month}</p>
                    <div className="flex items-center">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full rounded-full bg-[var(--brand)]"
                          style={{
                            width: `${Math.max(8, (point.total / maxTotal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--app-muted)]">
                      <span className="text-emerald-700">
                        입사 {point.joined}명
                      </span>
                      <span className="text-rose-700">퇴사 {point.left}명</span>
                      <span>총 {point.total.toLocaleString("ko-KR")}명</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="border border-dashed border-[var(--app-line)] bg-[#fbfbf8] p-4 text-sm text-[var(--app-muted)]">
                  직원수 추이 데이터가 아직 없습니다.
                </p>
              )}
            </div>
          </section>

          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <BriefcaseBusiness size={18} />
              진행 중인 공고
            </h2>
            <div className="mt-4 grid gap-3">
              {company.openJobs.length ? (
                company.openJobs.map((job) => (
                  <CompanyJobCard key={job.id} job={job} />
                ))
              ) : (
                <p className="border border-dashed border-[var(--app-line)] bg-[#fbfbf8] p-4 text-sm text-[var(--app-muted)]">
                  현재 게시 중인 공고는 없습니다. 회사 프로필은 계속 확인할 수
                  있습니다.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Globe2 size={18} />
            외부 링크
          </h2>
          <div className="mt-4 grid gap-3">
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--app-line)] px-3 py-3 text-sm font-medium"
              >
                회사 홈페이지 열기
                <ExternalLink size={16} />
              </a>
            )}
            {company.externalLinks.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--app-line)] px-3 py-3 text-sm font-medium"
              >
                관련 링크
                <ExternalLink size={16} />
              </a>
            ))}
          </div>

          <div className="mt-5 grid gap-3 border-t border-[var(--app-line)] pt-4 text-sm">
            <IconInfo
              icon={<Users size={16} />}
              label="직원수"
              value={
                company.employeeCount
                  ? `${company.employeeCount.toLocaleString("ko-KR")}명`
                  : "미공개"
              }
            />
            <IconInfo
              icon={<WalletCards size={16} />}
              label="평균연봉"
              value={formatSalary(company.averageSalary)}
            />
            <IconInfo
              icon={<CalendarDays size={16} />}
              label="설립연도"
              value={
                company.foundedYear
                  ? `${company.foundedYear.toString()}년`
                  : "미공개"
              }
            />
          </div>

          <div className="mt-5 border-t border-[var(--app-line)] pt-4">
            <h3 className="text-sm font-semibold">태그</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {company.tags.length ? (
                company.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[var(--app-line)] px-2 py-1 text-xs"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--app-muted)]">
                  태그 없음
                </span>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function CompanyJobCard({ job }: { job: JobListItem }) {
  return (
    <article className="border border-[var(--app-line)] bg-[#fbfbf8] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="teal">{jobFamilyLabels[job.jobFamily]}</Badge>
            <Badge>{traineeLabels[job.traineeStatus]}</Badge>
          </div>
          <h3 className="font-semibold">{job.title}</h3>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            {job.deadline
              ? new Date(job.deadline).toLocaleDateString("ko-KR")
              : deadlineTypeLabels[job.deadlineType]}
          </p>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
        >
          공고 보기
        </Link>
      </div>
    </article>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "teal";
}) {
  return (
    <span
      className={
        tone === "teal"
          ? "rounded bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800"
          : "rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700"
      }
    >
      {children}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--app-line)] bg-[#fbfbf8] px-3 py-2">
      <p className="text-xs text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function IconInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[var(--brand)]">{icon}</span>
      <div>
        <p className="text-xs text-[var(--app-muted)]">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function formatCompanyAge(foundedYear: number | null) {
  if (!foundedYear) return "미공개";
  const years = new Date().getFullYear() - foundedYear + 1;
  return `${years.toLocaleString("ko-KR")}년차`;
}

function formatSalary(salary: number | null) {
  if (!salary) return "미공개";
  return `${salary.toLocaleString("ko-KR")}만원`;
}

function formatRate(rate: number | null) {
  if (rate === null) return "미공개";
  return `${rate.toLocaleString("ko-KR")}%`;
}
