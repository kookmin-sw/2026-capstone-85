"use client";

import { COMPANY_TYPES } from "@cpa/shared";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminCompanies,
  type AdminCompany,
  companyTypeLabels,
} from "@/components/admin/admin-demo-data";
import { adminInputClass } from "@/components/admin/admin-ui";

function formatNullableNumber(value: number | null, suffix = "") {
  if (value === null) return "-";
  return `${value.toLocaleString("ko-KR")}${suffix}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const next = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (search.trim()) next.set("search", search.trim());
    if (companyType) next.set("companyType", companyType);
    return next;
  }, [companyType, page, search]);

  useEffect(() => {
    let ignore = false;
    fetchAdminCompanies(params)
      .then((data) => {
        if (!ignore) {
          setCompanies(data.items);
          setTotal(data.total);
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

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">회사 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            회사 생성과 수정만 제공합니다. 숨김/삭제는 이번 범위에서 제외합니다.
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--proto-brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--proto-brand-dark)]"
        >
          <Plus size={16} />
          회사 생성
        </Link>
      </div>

      <section className="rounded-lg border border-[var(--app-line)] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={`${adminInputClass} pl-9`}
              placeholder="회사명, 설명, 태그 검색"
            />
          </div>
          <select
            value={companyType}
            onChange={(event) => {
              setCompanyType(event.target.value);
              setPage(1);
            }}
            className={adminInputClass}
          >
            <option value="">전체 유형</option>
            {COMPANY_TYPES.map((type) => (
              <option key={type} value={type}>
                {companyTypeLabels[type]}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end text-sm text-gray-500">
            총 {total.toLocaleString("ko-KR")}개
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-[var(--app-line)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--app-line)] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">회사</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">프로필</th>
                <th className="px-4 py-3">공고/등록일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    회사를 불러오는 중입니다.
                  </td>
                </tr>
              ) : companies.length ? (
                companies.map((company) => (
                  <tr key={company.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="font-semibold text-gray-900 hover:text-[var(--proto-brand)]"
                      >
                        {company.name}
                      </Link>
                      <p className="mt-1 max-w-lg truncate text-xs text-gray-500">
                        {company.description ?? "설명 없음"}
                      </p>
                      {company.websiteUrl && (
                        <p className="mt-1 max-w-md truncate text-xs text-gray-400">
                          {company.websiteUrl}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {companyTypeLabels[company.type]}
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-gray-600">
                      <p>직원 {formatNullableNumber(company.employeeCount, "명")}</p>
                      <p>평균연봉 {formatNullableNumber(company.averageSalary, "만원")}</p>
                      <p>설립 {formatNullableNumber(company.foundedYear, "년")}</p>
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-gray-600">
                      <p>공고 {company.jobCount.toLocaleString("ko-KR")}건</p>
                      <p>{formatDate(company.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="rounded-md border border-[var(--app-line)] px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    조건에 맞는 회사가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-sm text-gray-500">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  );
}
