"use client";

import type { JobDetailItem } from "@cpa/shared";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { fetchJobDetail } from "@/lib/api";
import {
  companyTypeLabels,
  deadlineTypeLabels,
  employmentLabels,
  jobFamilyLabels,
  kicpaLabels,
  traineeLabels,
} from "@/lib/labels";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [job, setJob] = useState<JobDetailItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchJobDetail(id)
      .then((data) => {
        if (!ignore) {
          setJob(data);
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
        <div className="mx-auto max-w-5xl border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
          공고 상세를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-8">
        <div className="mx-auto max-w-5xl border border-red-200 bg-red-50 p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-700"
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-red-900">
            공고를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error || "요청한 공고가 없거나 더 이상 공개되지 않았습니다."}
          </p>
        </div>
      </main>
    );
  }

  return <JobDetail job={job} />;
}

function JobDetail({ job }: { job: JobDetailItem }) {
  const deadlineText =
    job.dDay === null
      ? deadlineTypeLabels[job.deadlineType]
      : job.dDay < 0
        ? "마감"
        : job.dDay === 0
          ? "오늘 마감"
          : `D-${job.dDay}`;

  const experienceText = useMemo(() => {
    if (job.minExperienceYears === null && job.maxExperienceYears === null)
      return "불명확";
    if (job.minExperienceYears !== null && job.maxExperienceYears !== null) {
      return `${job.minExperienceYears}~${job.maxExperienceYears}년`;
    }
    if (job.minExperienceYears !== null)
      return `${job.minExperienceYears}년 이상`;
    return `${job.maxExperienceYears}년 이하`;
  }, [job.maxExperienceYears, job.minExperienceYears]);

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

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="teal">{deadlineText}</Badge>
                <Badge>{companyTypeLabels[job.companyType]}</Badge>
                <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
              </div>
              <Link
                href={`/companies/${job.companyId}`}
                className="inline-flex items-center gap-3 text-sm font-medium text-[var(--app-muted)] hover:text-[var(--brand)]"
              >
                <CompanyLogo
                  name={job.companyName}
                  logoUrl={job.companyLogoUrl}
                  size="sm"
                />
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness size={16} />
                  {job.companyName}
                </span>
              </Link>
              <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal">
                {job.title}
              </h1>
            </div>

            <a
              href={job.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
            >
              원문에서 지원
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText size={18} />
              공고 정보
            </h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Info label="직무군" value={jobFamilyLabels[job.jobFamily]} />
              <Info
                label="고용형태"
                value={employmentLabels[job.employmentType]}
              />
              <Info
                label="KICPA 조건"
                value={kicpaLabels[job.kicpaCondition]}
              />
              <Info label="수습 CPA" value={traineeLabels[job.traineeStatus]} />
              <Info
                label="실무수습기관"
                value={trainingInstitutionText(
                  job.practicalTrainingInstitution,
                )}
              />
              <Info label="요구 경력" value={experienceText} />
              <Info label="지역" value={job.location ?? "불명확"} />
              <Info label="마감일" value={deadlineDisplay(job)} />
            </div>
          </section>

          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="text-lg font-semibold">공고 본문</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-800">
              {job.description}
            </p>
          </section>

          <section className="border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles size={18} />
              AI 요약
            </h2>
            {job.aiSuggestion ? (
              <div className="mt-4 grid gap-4">
                <p className="text-sm leading-7 text-neutral-800">
                  {job.aiSuggestion.summary}
                </p>
                <ChipGroup title="추천 태그" items={job.aiSuggestion.tags} />
                <ChipGroup title="확인 필요" items={job.aiSuggestion.risks} />
              </div>
            ) : (
              <p className="mt-4 border border-dashed border-[var(--app-line)] bg-[#fbfbf8] p-4 text-sm text-[var(--app-muted)]">
                아직 AI 요약이 없습니다. 추후 관리자 검수 후 요약과 태그가
                표시됩니다.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 size={18} />
            출처 정보
          </h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="출처" value={job.sourceName} />
            <Info
              label="최종 확인"
              value={new Date(job.lastCheckedAt).toLocaleString("ko-KR")}
            />
            <Info
              label="마감 유형"
              value={deadlineTypeLabels[job.deadlineType]}
            />
          </div>
          <a
            href={job.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--app-line)] px-3 py-3 text-sm font-medium"
          >
            원문 링크 열기
            <ExternalLink size={16} />
          </a>

          <div className="mt-5 border-t border-[var(--app-line)] pt-4">
            <h3 className="text-sm font-semibold">라벨</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.labels.length ? (
                job.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-[var(--app-line)] px-2 py-1 text-xs"
                  >
                    #{label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--app-muted)]">
                  라벨 없음
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/companies/${job.companyId}`}
            className="mt-5 flex items-center gap-3 border-t border-[var(--app-line)] pt-4 text-sm font-medium text-[var(--app-muted)] hover:text-[var(--brand)]"
          >
            <CompanyLogo
              name={job.companyName}
              logoUrl={job.companyLogoUrl}
              size="sm"
            />
            <span className="inline-flex items-center gap-2">
              <Building2 size={16} />
              회사 상세 보기
            </span>
          </Link>
        </aside>
      </section>
    </main>
  );
}

function deadlineDisplay(job: JobDetailItem) {
  if (!job.deadline) return deadlineTypeLabels[job.deadlineType];
  const date = new Date(job.deadline).toLocaleDateString("ko-KR");
  if (job.dDay === null) return date;
  if (job.dDay < 0) return `${date} · 마감`;
  if (job.dDay === 0) return `${date} · 오늘 마감`;
  return `${date} · D-${job.dDay}`;
}

function trainingInstitutionText(value: boolean | null) {
  if (value === true) return "인정 가능";
  if (value === false) return "인정 불가";
  return "확인 필요";
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

function ChipGroup({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded border border-[var(--app-line)] px-2 py-1 text-xs"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
