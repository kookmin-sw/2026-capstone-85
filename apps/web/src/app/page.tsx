"use client";

import type { JobListItem } from "@cpa/shared";
import { BriefcaseBusiness, CalendarDays, ExternalLink, Filter, LogIn, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchJobs } from "@/lib/api";
import {
  companyTypeLabels,
  deadlineTypeLabels,
  employmentLabels,
  jobFamilyLabels,
  kicpaLabels,
  traineeLabels,
} from "@/lib/labels";

const quickFilters = [
  { label: "수습 CPA", key: "traineeStatus", value: "AVAILABLE" },
  { label: "신입/주니어", key: "sort", value: "deadlineAsc" },
  { label: "마감 임박", key: "sort", value: "deadlineAsc" },
  { label: "Big4", key: "companyType", value: "BIG4" },
];

export default function Home() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [search, setSearch] = useState("");
  const [jobFamily, setJobFamily] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [traineeStatus, setTraineeStatus] = useState("");
  const [sort, setSort] = useState("deadlineAsc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const next = new URLSearchParams({ sort });
    if (search) next.set("search", search);
    if (jobFamily) next.set("jobFamily", jobFamily);
    if (companyType) next.set("companyType", companyType);
    if (traineeStatus) next.set("traineeStatus", traineeStatus);
    return next;
  }, [companyType, jobFamily, search, sort, traineeStatus]);

  useEffect(() => {
    let ignore = false;
    fetchJobs(params)
      .then((data) => {
        if (!ignore) {
          setJobs(data.items);
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
  }, [params]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--app-line)] bg-[var(--app-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--brand)]">CPA Jobs</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              회계사를 위한 채용공고 큐레이션
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-md border border-[var(--app-line)] px-3 py-2 text-sm font-medium"
            >
              관리자
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
            >
              <LogIn size={16} />
              로그인
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Filter size={16} />
            필터
          </div>
          <label className="block text-sm font-medium text-[var(--app-muted)]">
            검색
            <div className="mt-2 flex items-center gap-2 border border-[var(--app-line)] bg-white px-3 py-2">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="회사명, 직무, 키워드"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>

          <div className="mt-4 grid gap-3">
            <SelectField label="직무군" value={jobFamily} onChange={setJobFamily} options={jobFamilyLabels} />
            <SelectField
              label="회사 유형"
              value={companyType}
              onChange={setCompanyType}
              options={companyTypeLabels}
            />
            <SelectField
              label="수습 여부"
              value={traineeStatus}
              onChange={setTraineeStatus}
              options={traineeLabels}
            />
            <SelectField
              label="정렬"
              value={sort}
              onChange={setSort}
              options={{ deadlineAsc: "마감 임박순", latest: "최신순" }}
              allowEmpty={false}
            />
          </div>
        </aside>

        <section>
          <div className="mb-4 grid gap-3 border border-[var(--app-line)] bg-[var(--app-surface)] p-4 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-lg font-semibold">요즘 확인할 공고</h2>
              <p className="text-sm text-[var(--app-muted)]">
                수습 가능 여부, KICPA 조건, 마감일과 출처를 함께 확인하세요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.label}
                  className="rounded-md border border-[var(--app-line)] px-3 py-2 text-sm font-medium hover:border-[var(--brand)]"
                  onClick={() => {
                    if (filter.key === "traineeStatus") setTraineeStatus(filter.value);
                    if (filter.key === "companyType") setCompanyType(filter.value);
                    if (filter.key === "sort") setSort(filter.value);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error} API 서버가 실행 중인지 확인해 주세요.
            </div>
          )}

          <div className="grid gap-3">
            {loading ? (
              <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
                공고를 불러오는 중입니다.
              </div>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  allowEmpty?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-[var(--app-muted)]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[var(--app-line)] bg-white px-3 py-2 text-[var(--foreground)]"
      >
        {allowEmpty && <option value="">전체</option>}
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function JobCard({ job }: { job: JobListItem }) {
  const deadlineText =
    job.dDay === null
      ? deadlineTypeLabels[job.deadlineType]
      : job.dDay < 0
        ? "마감"
        : job.dDay === 0
          ? "오늘 마감"
          : `D-${job.dDay}`;

  return (
    <article className="border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{deadlineText}</Badge>
            <Badge>{companyTypeLabels[job.companyType]}</Badge>
            <Badge>{jobFamilyLabels[job.jobFamily]}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--app-muted)]">
            <BriefcaseBusiness size={15} />
            {job.companyName} · {employmentLabels[job.employmentType]}
          </p>
        </div>
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

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <Info label="KICPA 조건" value={kicpaLabels[job.kicpaCondition]} />
        <Info label="수습 CPA" value={traineeLabels[job.traineeStatus]} />
        <Info
          label="마감일"
          value={job.deadline ? new Date(job.deadline).toLocaleDateString("ko-KR") : deadlineTypeLabels[job.deadlineType]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--app-muted)]">
        <CalendarDays size={14} />
        출처: {job.sourceName}
        <span>·</span>
        최종 확인: {new Date(job.lastCheckedAt).toLocaleString("ko-KR")}
        {job.labels.map((label) => (
          <span key={label} className="rounded border border-[var(--app-line)] px-2 py-1">
            #{label}
          </span>
        ))}
      </div>
    </article>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "teal" }) {
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
