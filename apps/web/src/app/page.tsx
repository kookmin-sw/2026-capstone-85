"use client";

import type {
  CompanyListItem,
  JobCalendarDay,
  JobListItem,
} from "@cpa/shared";
import { ArrowRight, Building2, Filter, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { MiniDeadlineCalendar } from "@/components/deadline-calendar";
import {
  FilterGroup,
  InputField,
  JobFilterPanel,
  RangeFields,
  SelectField,
} from "@/components/job-filter-panel";
import { Badge, Info, JobCard } from "@/components/job-card";
import { useJobFilterState } from "@/hooks/use-job-filter-state";
import { fetchCompanies, fetchJobCalendar, fetchJobs } from "@/lib/api";
import { calendarDaysToMap, jobsBetween } from "@/lib/calendar-data";
import {
  endOfWeek,
  getCalendarGridRange,
  startOfWeek,
  toDateKey,
} from "@/lib/date-utils";
import {
  buildJobFilterParams,
  quickFilterState,
  quickJobFilters,
} from "@/lib/job-filters";
import { companyTypeLabels } from "@/lib/labels";

const openJobLabels = {
  true: "채용 중",
  false: "공고 없음",
};

const companySortLabels = {
  name: "회사명순",
  employeeCountDesc: "직원수 많은순",
  averageSalaryDesc: "평균연봉 높은순",
  companyAgeDesc: "업력 높은순",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"jobs" | "companies">("jobs");
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyListType, setCompanyListType] = useState("");
  const [companyTag, setCompanyTag] = useState("");
  const [hasOpenJobs, setHasOpenJobs] = useState("");
  const [minEmployeeCount, setMinEmployeeCount] = useState("");
  const [maxEmployeeCount, setMaxEmployeeCount] = useState("");
  const [minAverageSalary, setMinAverageSalary] = useState("");
  const [maxAverageSalary, setMaxAverageSalary] = useState("");
  const [companyMinAgeYears, setCompanyMinAgeYears] = useState("");
  const [companyMaxAgeYears, setCompanyMaxAgeYears] = useState("");
  const [companyMaxAttritionRate, setCompanyMaxAttritionRate] = useState("");
  const [companySort, setCompanySort] = useState("name");
  const [error, setError] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [companyOpenTotal, setCompanyOpenTotal] = useState(0);
  const [companyNoJobTotal, setCompanyNoJobTotal] = useState(0);
  const [miniMonth, setMiniMonth] = useState(() => new Date());
  const [calendarDays, setCalendarDays] = useState<JobCalendarDay[]>([]);
  const { filters, setFilters, ready, queryString } = useJobFilterState();

  const params = useMemo(() => buildJobFilterParams(filters), [filters]);

  const companyParams = useMemo(() => {
    const next = new URLSearchParams({ sort: companySort });
    if (companySearch) next.set("search", companySearch);
    if (companyListType) next.set("companyType", companyListType);
    if (companyTag) next.set("tag", companyTag);
    if (hasOpenJobs) next.set("hasOpenJobs", hasOpenJobs);
    if (minEmployeeCount) next.set("minEmployeeCount", minEmployeeCount);
    if (maxEmployeeCount) next.set("maxEmployeeCount", maxEmployeeCount);
    if (minAverageSalary) next.set("minAverageSalary", minAverageSalary);
    if (maxAverageSalary) next.set("maxAverageSalary", maxAverageSalary);
    if (companyMinAgeYears)
      next.set("minCompanyAgeYears", companyMinAgeYears);
    if (companyMaxAgeYears)
      next.set("maxCompanyAgeYears", companyMaxAgeYears);
    if (companyMaxAttritionRate)
      next.set("maxAttritionRate", companyMaxAttritionRate);
    return next;
  }, [
    companyListType,
    companyMaxAgeYears,
    companyMaxAttritionRate,
    companyMinAgeYears,
    companySearch,
    companySort,
    companyTag,
    hasOpenJobs,
    maxAverageSalary,
    maxEmployeeCount,
    minAverageSalary,
    minEmployeeCount,
  ]);

  const calendarRange = useMemo(() => {
    const grid = getCalendarGridRange(miniMonth);
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return {
      from: grid.from < weekStart ? grid.from : weekStart,
      to: grid.to > weekEnd ? grid.to : weekEnd,
    };
  }, [miniMonth]);

  const calendarParams = useMemo(() => {
    const next = buildJobFilterParams(filters);
    next.set("from", toDateKey(calendarRange.from));
    next.set("to", toDateKey(calendarRange.to));
    return next;
  }, [calendarRange, filters]);

  useEffect(() => {
    if (!ready) return;
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
  }, [params, ready]);

  useEffect(() => {
    if (!ready) return;
    let ignore = false;
    fetchJobCalendar(calendarParams)
      .then((data) => {
        if (!ignore) {
          setCalendarDays(data.days);
          setCalendarError("");
        }
      })
      .catch((caught: Error) => {
        if (!ignore) setCalendarError(caught.message);
      })
      .finally(() => {
        if (!ignore) setCalendarLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [calendarParams, ready]);

  useEffect(() => {
    let ignore = false;
    fetchCompanies(companyParams)
      .then((data) => {
        if (!ignore) {
          setCompanies(data.items);
          setCompanyTotal(data.total);
          setCompanyOpenTotal(data.openTotal);
          setCompanyNoJobTotal(data.noJobTotal);
          setCompanyError("");
        }
      })
      .catch((caught: Error) => {
        if (!ignore) setCompanyError(caught.message);
      })
      .finally(() => {
        if (!ignore) setCompaniesLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [companyParams]);

  const dayMap = useMemo(() => calendarDaysToMap(calendarDays), [calendarDays]);
  const weekJobs = useMemo(
    () => jobsBetween(calendarDays, startOfWeek(new Date()), endOfWeek(new Date())),
    [calendarDays],
  );
  const calendarHref = `/calendar${queryString ? `?${queryString}` : ""}`;

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
          {activeTab === "jobs" ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Filter size={16} />
                필터
              </div>
              <JobFilterPanel filters={filters} onChange={setFilters} />
            </>
          ) : (
            <CompanyFilterPanel
              companySearch={companySearch}
              setCompanySearch={setCompanySearch}
              companyListType={companyListType}
              setCompanyListType={setCompanyListType}
              companyTag={companyTag}
              setCompanyTag={setCompanyTag}
              hasOpenJobs={hasOpenJobs}
              setHasOpenJobs={setHasOpenJobs}
              minEmployeeCount={minEmployeeCount}
              setMinEmployeeCount={setMinEmployeeCount}
              maxEmployeeCount={maxEmployeeCount}
              setMaxEmployeeCount={setMaxEmployeeCount}
              minAverageSalary={minAverageSalary}
              setMinAverageSalary={setMinAverageSalary}
              maxAverageSalary={maxAverageSalary}
              setMaxAverageSalary={setMaxAverageSalary}
              companyMinAgeYears={companyMinAgeYears}
              setCompanyMinAgeYears={setCompanyMinAgeYears}
              companyMaxAgeYears={companyMaxAgeYears}
              setCompanyMaxAgeYears={setCompanyMaxAgeYears}
              companyMaxAttritionRate={companyMaxAttritionRate}
              setCompanyMaxAttritionRate={setCompanyMaxAttritionRate}
              companySort={companySort}
              setCompanySort={setCompanySort}
              companyTotal={companyTotal}
              companyNoJobTotal={companyNoJobTotal}
            />
          )}
        </aside>

        <section>
          <div className="mb-4 grid gap-3 border border-[var(--app-line)] bg-[var(--app-surface)] p-4 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 inline-flex rounded-md border border-[var(--app-line)] bg-white p-1">
                <TabButton
                  active={activeTab === "jobs"}
                  onClick={() => setActiveTab("jobs")}
                >
                  공고
                </TabButton>
                <TabButton
                  active={activeTab === "companies"}
                  onClick={() => setActiveTab("companies")}
                >
                  회사
                </TabButton>
              </div>
              <h2 className="text-lg font-semibold">
                {activeTab === "jobs" ? "요즘 확인할 공고" : "탐색 가능한 회사"}
              </h2>
              <p className="text-sm text-[var(--app-muted)]">
                {activeTab === "jobs"
                  ? "수습 가능 여부, KICPA 조건, 마감일과 출처를 함께 확인하세요."
                  : "현재 공고가 없는 회사까지 포함해 회사 프로필을 확인하세요."}
              </p>
            </div>
            {activeTab === "jobs" ? (
              <div className="flex flex-wrap gap-2">
                {quickJobFilters.map((filter) => (
                  <button
                    key={filter.label}
                    className="rounded-md border border-[var(--app-line)] px-3 py-2 text-sm font-medium hover:border-[var(--brand)]"
                    onClick={() => setFilters(quickFilterState(filter.values))}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Info
                  label="표시 중"
                  value={`${companyTotal.toLocaleString("ko-KR")}개`}
                />
                <Info
                  label="채용 중"
                  value={`${companyOpenTotal.toLocaleString("ko-KR")}개`}
                />
              </div>
            )}
          </div>

          {activeTab === "jobs" && error && (
            <div className="mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error} API 서버가 실행 중인지 확인해 주세요.
            </div>
          )}

          {activeTab === "companies" && companyError && (
            <div className="mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {companyError} API 서버가 실행 중인지 확인해 주세요.
            </div>
          )}

          {activeTab === "jobs" ? (
            <div className="grid gap-4">
              {calendarError && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {calendarError} 캘린더 API 서버를 확인해 주세요.
                </div>
              )}
              {calendarLoading ? (
                <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
                  캘린더를 불러오는 중입니다.
                </div>
              ) : (
                <MiniDeadlineCalendar
                  monthDate={miniMonth}
                  dayMap={dayMap}
                  weekJobs={weekJobs}
                  calendarHref={calendarHref}
                  onMonthChange={setMiniMonth}
                />
              )}

              {loading ? (
                <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
                  공고를 불러오는 중입니다.
                </div>
              ) : jobs.length ? (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
                  검색 조건에 맞는 공고가 없습니다.
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {companiesLoading ? (
                <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)] md:col-span-2">
                  회사 목록을 불러오는 중입니다.
                </div>
              ) : companies.length ? (
                companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))
              ) : (
                <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)] md:col-span-2">
                  검색 조건에 맞는 회사가 없습니다.
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function CompanyFilterPanel({
  companySearch,
  setCompanySearch,
  companyListType,
  setCompanyListType,
  companyTag,
  setCompanyTag,
  hasOpenJobs,
  setHasOpenJobs,
  minEmployeeCount,
  setMinEmployeeCount,
  maxEmployeeCount,
  setMaxEmployeeCount,
  minAverageSalary,
  setMinAverageSalary,
  maxAverageSalary,
  setMaxAverageSalary,
  companyMinAgeYears,
  setCompanyMinAgeYears,
  companyMaxAgeYears,
  setCompanyMaxAgeYears,
  companyMaxAttritionRate,
  setCompanyMaxAttritionRate,
  companySort,
  setCompanySort,
  companyTotal,
  companyNoJobTotal,
}: {
  companySearch: string;
  setCompanySearch: (value: string) => void;
  companyListType: string;
  setCompanyListType: (value: string) => void;
  companyTag: string;
  setCompanyTag: (value: string) => void;
  hasOpenJobs: string;
  setHasOpenJobs: (value: string) => void;
  minEmployeeCount: string;
  setMinEmployeeCount: (value: string) => void;
  maxEmployeeCount: string;
  setMaxEmployeeCount: (value: string) => void;
  minAverageSalary: string;
  setMinAverageSalary: (value: string) => void;
  maxAverageSalary: string;
  setMaxAverageSalary: (value: string) => void;
  companyMinAgeYears: string;
  setCompanyMinAgeYears: (value: string) => void;
  companyMaxAgeYears: string;
  setCompanyMaxAgeYears: (value: string) => void;
  companyMaxAttritionRate: string;
  setCompanyMaxAttritionRate: (value: string) => void;
  companySort: string;
  setCompanySort: (value: string) => void;
  companyTotal: number;
  companyNoJobTotal: number;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Building2 size={16} />
        회사 탐색
      </div>
      <InputField
        label="검색"
        value={companySearch}
        onChange={setCompanySearch}
        placeholder="회사명, 유형, 태그"
      />
      <div className="mt-4 grid gap-4">
        <FilterGroup title="회사 필터">
          <SelectField
            label="회사 유형"
            value={companyListType}
            onChange={setCompanyListType}
            options={companyTypeLabels}
          />
          <InputField
            label="태그"
            value={companyTag}
            onChange={setCompanyTag}
            placeholder="ESG, 감사"
          />
          <SelectField
            label="채용 상태"
            value={hasOpenJobs}
            onChange={setHasOpenJobs}
            options={openJobLabels}
          />
          <RangeFields
            label="직원수"
            minValue={minEmployeeCount}
            maxValue={maxEmployeeCount}
            onMinChange={setMinEmployeeCount}
            onMaxChange={setMaxEmployeeCount}
            unit="명"
          />
          <RangeFields
            label="평균연봉"
            minValue={minAverageSalary}
            maxValue={maxAverageSalary}
            onMinChange={setMinAverageSalary}
            onMaxChange={setMaxAverageSalary}
            unit="만원"
          />
          <RangeFields
            label="업력"
            minValue={companyMinAgeYears}
            maxValue={companyMaxAgeYears}
            onMinChange={setCompanyMinAgeYears}
            onMaxChange={setCompanyMaxAgeYears}
            unit="년"
          />
          <InputField
            label="퇴사율 이하"
            value={companyMaxAttritionRate}
            onChange={setCompanyMaxAttritionRate}
            placeholder="10"
            type="number"
          />
          <SelectField
            label="정렬"
            value={companySort}
            onChange={setCompanySort}
            options={companySortLabels}
            allowEmpty={false}
          />
        </FilterGroup>

        <div className="grid gap-2 text-sm">
          <Info
            label="검색 결과"
            value={`${companyTotal.toLocaleString("ko-KR")}개`}
          />
          <Info
            label="공고 없는 회사"
            value={`${companyNoJobTotal.toLocaleString("ko-KR")}개`}
          />
        </div>
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
          : "rounded px-4 py-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[var(--foreground)]"
      }
    >
      {children}
    </button>
  );
}

function CompanyCard({ company }: { company: CompanyListItem }) {
  return (
    <article className="flex h-full flex-col gap-4 border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
      <CompanyLogo name={company.name} logoUrl={company.logoUrl} />

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="teal">{companyTypeLabels[company.type]}</Badge>
          <Badge>
            {company.openJobCount > 0
              ? `채용 중 ${company.openJobCount}건`
              : "현재 공고 없음"}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold">{company.name}</h3>
        <p className="mt-2 min-h-14 text-sm leading-6 text-[var(--app-muted)]">
          {company.description ?? "회사 소개가 준비 중입니다."}
        </p>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
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
            label="퇴사율"
            value={formatRate(company.recentAttritionRate)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {company.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[var(--app-line)] px-2 py-1 text-xs text-[var(--app-muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <Link
          href={`/companies/${company.id}`}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
        >
          회사 상세 보기
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
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
