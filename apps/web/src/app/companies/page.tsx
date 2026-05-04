"use client";

import type { CompanyListItem } from "@cpa/shared";
import { ArrowRight, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { fetchCompanies } from "@/lib/api";
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

function bannerGradient(_name: string) {
  return "#F7F7F7";
}

export default function CompaniesPage() {
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
  const [companyError, setCompanyError] = useState("");
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [companyOpenTotal, setCompanyOpenTotal] = useState(0);
  const [companyNoJobTotal, setCompanyNoJobTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

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
    if (companyMinAgeYears) next.set("minCompanyAgeYears", companyMinAgeYears);
    if (companyMaxAgeYears) next.set("maxCompanyAgeYears", companyMaxAgeYears);
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

  useEffect(() => {
    let ignore = false;
    setCompaniesLoading(true);
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

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNav />

      {/* 페이지 헤더 — 배경색 통일 */}
      <div className="border-b border-[var(--app-line)] bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">회사 탐색</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            현재 공고가 없는 회사까지 포함해 회사 프로필을 확인하세요.
          </p>

          {/* 검색바 */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="회사명, 유형, 태그로 검색"
                className="w-full rounded-xl border border-[var(--app-line)] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--proto-brand)" }}
            >
              <Search size={15} />
              검색
            </button>
            <select
              value={companySort}
              onChange={(e) => setCompanySort(e.target.value)}
              className="rounded-xl border border-[var(--app-line)] bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none"
            >
              {Object.entries(companySortLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 필터 카드 */}
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <div className="rounded-2xl border border-[var(--app-line)] bg-white">
            {/* 필터 헤더 */}
            <div className="flex items-center justify-between px-5 py-3">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-700"
              >
                <SlidersHorizontal
                  size={15}
                  style={{ color: "var(--proto-brand)" }}
                />
                필터
                <span className="text-xs font-medium text-gray-400">
                  {filterOpen ? "필터 닫기 ∧" : "필터 열기 ∨"}
                </span>
              </button>
              {filterOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setCompanyListType("");
                    setCompanyTag("");
                    setHasOpenJobs("");
                    setMinEmployeeCount("");
                    setMaxEmployeeCount("");
                    setMinAverageSalary("");
                    setMaxAverageSalary("");
                    setCompanyMinAgeYears("");
                    setCompanyMaxAgeYears("");
                    setCompanyMaxAttritionRate("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw size={12} />
                  필터 초기화
                </button>
              )}
            </div>

            {/* 체크박스 필터 컬럼들 */}
            {filterOpen && (
              <div className="overflow-x-auto border-t border-[var(--app-line)] px-5 py-4">
                <div className="flex gap-8">
                  {/* 회사 유형 */}
                  <div className="min-w-[120px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">회사 유형</h3>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { value: "", label: "전체" },
                        { value: "BIG4", label: "Big4" },
                        { value: "LOCAL_ACCOUNTING_FIRM", label: "로컬 회계법인" },
                        { value: "MID_SMALL_ACCOUNTING_FIRM", label: "중소 회계법인" },
                        { value: "FINANCIAL_COMPANY", label: "금융사" },
                        { value: "GENERAL_COMPANY", label: "일반 기업" },
                        { value: "PUBLIC_INSTITUTION", label: "공공기관" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={companyListType === opt.value}
                            onChange={() => setCompanyListType(companyListType === opt.value && opt.value !== "" ? "" : opt.value)}
                            className="h-3.5 w-3.5 accent-[#E8457A]"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 채용 상태 */}
                  <div className="min-w-[80px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">채용 상태</h3>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { value: "", label: "전체" },
                        { value: "true", label: "채용 중" },
                        { value: "false", label: "공고 없음" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={hasOpenJobs === opt.value}
                            onChange={() => setHasOpenJobs(hasOpenJobs === opt.value && opt.value !== "" ? "" : opt.value)}
                            className="h-3.5 w-3.5 accent-[#E8457A]"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 태그 */}
                  <div className="min-w-[120px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">태그</h3>
                    <input
                      value={companyTag}
                      onChange={(e) => setCompanyTag(e.target.value)}
                      placeholder="ESG, 감사"
                      className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                    />
                  </div>

                  {/* 직원수 */}
                  <div className="min-w-[120px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">직원수 (명)</h3>
                    <div className="flex flex-col gap-2">
                      <input
                        type="number" min={0}
                        value={minEmployeeCount}
                        onChange={(e) => setMinEmployeeCount(e.target.value)}
                        placeholder="최소"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                      <input
                        type="number" min={0}
                        value={maxEmployeeCount}
                        onChange={(e) => setMaxEmployeeCount(e.target.value)}
                        placeholder="최대"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>

                  {/* 평균연봉 */}
                  <div className="min-w-[120px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">평균연봉 (만원)</h3>
                    <div className="flex flex-col gap-2">
                      <input
                        type="number" min={0}
                        value={minAverageSalary}
                        onChange={(e) => setMinAverageSalary(e.target.value)}
                        placeholder="최소"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                      <input
                        type="number" min={0}
                        value={maxAverageSalary}
                        onChange={(e) => setMaxAverageSalary(e.target.value)}
                        placeholder="최대"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>

                  {/* 업력 */}
                  <div className="min-w-[100px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">업력 (년)</h3>
                    <div className="flex flex-col gap-2">
                      <input
                        type="number" min={0}
                        value={companyMinAgeYears}
                        onChange={(e) => setCompanyMinAgeYears(e.target.value)}
                        placeholder="최소"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                      <input
                        type="number" min={0}
                        value={companyMaxAgeYears}
                        onChange={(e) => setCompanyMaxAgeYears(e.target.value)}
                        placeholder="최대"
                        className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>

                  {/* 퇴사율 */}
                  <div className="min-w-[100px]">
                    <h3 className="mb-2 text-xs font-bold text-gray-800">퇴사율 이하</h3>
                    <input
                      type="number" min={0}
                      value={companyMaxAttritionRate}
                      onChange={(e) => setCompanyMaxAttritionRate(e.target.value)}
                      placeholder="10%"
                      className="w-full rounded-lg border border-[var(--app-line)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats row */}
        <div className="mb-5 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>
            전체{" "}
            <strong className="text-gray-900">
              {companyTotal.toLocaleString("ko-KR")}
            </strong>
            개
          </span>
          <span>
            채용 중{" "}
            <strong style={{ color: "var(--proto-brand)" }}>
              {companyOpenTotal.toLocaleString("ko-KR")}
            </strong>
            개
          </span>
          <span>
            공고 없음{" "}
            <strong className="text-gray-900">
              {companyNoJobTotal.toLocaleString("ko-KR")}
            </strong>
            개
          </span>
        </div>

        {companyError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {companyError} API 서버가 실행 중인지 확인해 주세요.
          </div>
        )}

        {companiesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : companies.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--app-line)] bg-white p-10 text-center text-sm text-[var(--app-muted)]">
            검색 조건에 맞는 회사가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}

function CompanyCard({ company }: { company: CompanyListItem }) {
  const initial = company.name.charAt(0);
  const gradient = bannerGradient(company.name);
  const hasJobs = company.openJobCount > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
      {/* Banner */}
      <div
        className="relative flex h-24 items-end px-5 pb-3"
        style={{ background: gradient }}
      >
        {hasJobs && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: "var(--proto-brand)" }}
          >
            채용 중 {company.openJobCount}
          </span>
        )}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow"
          style={{ background: "var(--proto-brand)" }}
        >
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            initial
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5">
          <span className="rounded-md bg-[#FFF0F5] px-2.5 py-0.5 text-xs font-semibold text-[#E8457A]">
            {companyTypeLabels[company.type]}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900">{company.name}</h3>
        <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-gray-500">
          {company.description ?? "회사 소개가 준비 중입니다."}
        </p>

        <div className="mb-3 grid grid-cols-2 gap-1.5 text-xs text-gray-500">
          <span>🏢 {formatCompanyAge(company.foundedYear)}</span>
          <span>
            👥{" "}
            {company.employeeCount
              ? `${company.employeeCount.toLocaleString("ko-KR")}명`
              : "미공개"}
          </span>
          <span>💰 {formatSalary(company.averageSalary)}</span>
          <span>📉 퇴사율 {formatRate(company.recentAttritionRate)}</span>
        </div>

        {company.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {company.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/companies/${company.id}`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--proto-brand)" }}
        >
          상세 보기
          <ArrowRight size={13} />
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
