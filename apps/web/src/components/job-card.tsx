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
    <article className="border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{deadlineText(job)}</Badge>
            <Badge>{companyTypeLabels[job.companyType]}</Badge>
            <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--app-muted)]">
            <BriefcaseBusiness size={15} />
            {job.companyName} · {employmentLabels[job.employmentType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
          >
            상세 보기
          </Link>
          <a
            href={job.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--app-line)] px-3 py-2 text-sm font-medium"
          >
            원문
            <ExternalLink size={15} />
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

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--app-muted)]">
        <CalendarDays size={14} />
        출처: {job.sourceName}
        <span>·</span>
        최종 확인: {new Date(job.lastCheckedAt).toLocaleString("ko-KR")}
        {job.labels.map((label) => (
          <span
            key={label}
            className="rounded border border-[var(--app-line)] px-2 py-1"
          >
            #{label}
          </span>
        ))}
      </div>
    </article>
  );
}

export function CompactJobRow({ job }: { job: JobListItem }) {
  return (
    <div className="grid gap-2 border border-[var(--app-line)] bg-white p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="mb-1 flex flex-wrap gap-2">
          <Badge tone="teal">{deadlineText(job)}</Badge>
          <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
          <Badge>{employmentLabels[job.employmentType]}</Badge>
        </div>
        <p className="font-semibold">{job.title}</p>
        <p className="text-sm text-[var(--app-muted)]">
          {job.companyName} · {job.location ?? "지역 불명확"}
        </p>
      </div>
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center justify-center rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
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

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--app-line)] bg-[#fbfbf8] px-3 py-2">
      <p className="text-xs text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
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
