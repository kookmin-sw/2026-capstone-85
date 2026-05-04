import type { JobListItem } from "@cpa/shared";
import { BriefcaseBusiness, CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  companyTypeLabels,
  deadlineTypeLabels,
  employmentLabels,
  jobFamilyLabels,
  kicpaLabels,
  traineeLabels,
} from "@/lib/labels";

export function JobCard({ job }: { job: JobListItem }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="pink">{deadlineText(job)}</Badge>
            <Badge>{companyTypeLabels[job.companyType]}</Badge>
            <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
          </div>
          <h3 className="text-base font-semibold leading-snug text-gray-900">{job.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <BriefcaseBusiness size={14} />
            {job.companyName} · {employmentLabels[job.employmentType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            상세 보기
          </Link>
          <a
            href={job.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-line)] px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300"
          >
            원문
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3 xl:grid-cols-6">
        <Info label="KICPA 조건" value={kicpaLabels[job.kicpaCondition]} />
        <Info label="수습 CPA" value={traineeLabels[job.traineeStatus]} />
        <Info
          label="실무수습기관"
          value={trainingInstitutionText(job.practicalTrainingInstitution)}
        />
        <Info label="요구 경력" value={experienceText(job)} />
        <Info label="지역" value={job.location ?? "불명확"} />
        <Info
          label="마감일"
          value={
            job.deadline
              ? new Date(job.deadline).toLocaleDateString("ko-KR")
              : deadlineTypeLabels[job.deadlineType]
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <CalendarDays size={13} />
        출처: {job.sourceName}
        <span>·</span>
        최종 확인: {new Date(job.lastCheckedAt).toLocaleString("ko-KR")}
        {job.labels.map((label) => (
          <span
            key={label}
            className="rounded-md border border-[var(--app-line)] px-2 py-0.5"
          >
            #{label}
          </span>
        ))}
      </div>
    </article>
  );
}

export function JobGridCard({ job }: { job: JobListItem }) {
  const initial = job.companyName.charAt(0);
  const dDay = job.dDay;
  const dDayLabel =
    dDay === null
      ? null
      : dDay < 0
        ? "마감"
        : dDay === 0
          ? "D-Day"
          : `D-${dDay}`;
  const isUrgent = dDay !== null && dDay >= 0 && dDay <= 7;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
      {/* 배너 — 흰색 계열 통일 */}
      <div className="relative flex h-28 items-end bg-gray-50 px-5 pb-3">
        {dDayLabel && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{
              background: isUrgent ? "#E8457A" : "rgba(0,0,0,0.30)",
            }}
          >
            {dDayLabel}
          </span>
        )}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-black text-white shadow-md"
          style={{ background: "var(--proto-brand)" }}
        >
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="ml-3 min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {job.companyName}
          </p>
          <p className="text-xs text-gray-400">
            {companyTypeLabels[job.companyType]}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <Badge tone="pink">{jobFamilyLabels[job.jobFamily]}</Badge>
          <Badge>{employmentLabels[job.employmentType]}</Badge>
        </div>
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-relaxed text-gray-900">
          {job.title}
        </h3>
        <div className="mt-auto grid grid-cols-2 gap-1.5 text-xs text-gray-500">
          <span className="truncate">📍 {job.location ?? "지역 불명확"}</span>
          <span className="truncate">🎓 {kicpaLabels[job.kicpaCondition]}</span>
          <span className="truncate">👤 {traineeLabels[job.traineeStatus]}</span>
          <span className="truncate">📅 {experienceText(job)}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/jobs/${job.id}`}
            className="flex-1 rounded-xl py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--proto-brand)" }}
          >
            상세 보기
          </Link>
          <a
            href={job.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-xl border border-[var(--app-line)] px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}

export function CompactJobRow({ job }: { job: JobListItem }) {
  return (
    <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Badge tone="pink">{deadlineText(job)}</Badge>
          <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
          <Badge>{employmentLabels[job.employmentType]}</Badge>
        </div>
        <p className="font-semibold text-gray-900">{job.title}</p>
        <p className="mt-0.5 text-sm text-gray-500">
          {job.companyName} · {job.location ?? "지역 불명확"}
        </p>
      </div>
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        상세 보기
      </Link>
    </div>
  );
}

export function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "pink";
}) {
  return (
    <span
      className={
        tone === "pink"
          ? "rounded-md bg-[#FFF0F5] px-2.5 py-0.5 text-xs font-semibold text-[#E8457A]"
          : "rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600"
      }
    >
      {children}
    </span>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

export function deadlineText(job: JobListItem) {
  if (job.dDay === null) return deadlineTypeLabels[job.deadlineType];
  if (job.dDay < 0) return "마감";
  if (job.dDay === 0) return "오늘 마감";
  return `D-${job.dDay}`;
}

export function experienceText(job: JobListItem) {
  if (job.minExperienceYears === null && job.maxExperienceYears === null) {
    return "불명확";
  }
  if (job.minExperienceYears !== null && job.maxExperienceYears !== null) {
    return `${job.minExperienceYears}~${job.maxExperienceYears}년`;
  }
  if (job.minExperienceYears !== null) {
    return `${job.minExperienceYears}년 이상`;
  }
  return `${job.maxExperienceYears}년 이하`;
}

export function trainingInstitutionText(value: boolean | null) {
  if (value === true) return "인정 가능";
  if (value === false) return "인정 불가";
  return "확인 필요";
}
