"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { JobStatusBadge } from "@/components/admin/status-badge";
import {
  fetchAdminCompanies,
  fetchAdminJobs,
  updateAdminJobStatus,
  type AdminCompany,
  type AdminJob,
  type JobStatus,
  deadlineTypeLabels,
  employmentLabels,
  jobFamilyLabels,
  jobStatusLabels,
  kicpaLabels,
  traineeLabels,
} from "@/components/admin/admin-demo-data";
import { adminInputClass } from "@/components/admin/admin-ui";

const STATUS_OPTIONS = ["OPEN", "CLOSED", "DRAFT"] as const;

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<{
    job: AdminJob;
    status: JobStatus;
  } | null>(null);

  const params = useMemo(() => {
    const next = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (search.trim()) next.set("search", search.trim());
    if (status) next.set("status", status);
    if (companyId) next.set("companyId", companyId);
    return next;
  }, [companyId, page, search, status]);

  useEffect(() => {
    let ignore = false;
    fetchAdminCompanies(new URLSearchParams({ pageSize: "100" }))
      .then((data) => {
        if (!ignore) setCompanies(data.items);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchAdminJobs(params)
      .then((data) => {
        if (!ignore) {
          setJobs(data.items);
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

  async function applyStatusChange() {
    if (!pendingStatus) return;
    const target = pendingStatus;
    setPendingStatus(null);
    try {
      const updated = await updateAdminJobStatus(target.job.id, target.status);
      setJobs((current) =>
        current.map((job) => (job.id === updated.id ? updated : job)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "상태 변경 실패");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">공고 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            공고 상태를 게시중, 마감, 숨김/임시저장으로 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--proto-brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--proto-brand-dark)]"
        >
          <Plus size={16} />
          공고 생성
        </Link>
      </div>

      <section className="rounded-lg border border-[var(--app-line)] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_240px_auto]">
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
              placeholder="제목, 설명, 회사명 검색"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={adminInputClass}
          >
            <option value="">전체 상태</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {jobStatusLabels[option]}
              </option>
            ))}
          </select>
          <select
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setPage(1);
            }}
            className={adminInputClass}
          >
            <option value="">전체 회사</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end text-sm text-gray-500">
            총 {total.toLocaleString("ko-KR")}건
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
                <th className="px-4 py-3">공고</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">조건</th>
                <th className="px-4 py-3">마감/출처</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    공고를 불러오는 중입니다.
                  </td>
                </tr>
              ) : jobs.length ? (
                jobs.map((job) => (
                  <tr key={job.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="font-semibold text-gray-900 hover:text-[var(--proto-brand)]"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">{job.companyName}</p>
                      <p className="mt-1 max-w-xl truncate text-xs text-gray-400">
                        {job.originalUrl}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-gray-600">
                      <p>{jobFamilyLabels[job.jobFamily]} · {employmentLabels[job.employmentType]}</p>
                      <p>{kicpaLabels[job.kicpaCondition]} · {traineeLabels[job.traineeStatus]}</p>
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-gray-600">
                      <p>
                        {deadlineTypeLabels[job.deadlineType]} · {formatDate(job.deadline)}
                      </p>
                      <p>{job.sourceName}</p>
                      <p>확인 {formatDate(job.lastCheckedAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="rounded-md border border-[var(--app-line)] px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          수정
                        </Link>
                        {STATUS_OPTIONS.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            disabled={job.status === nextStatus}
                            onClick={() =>
                              setPendingStatus({ job, status: nextStatus })
                            }
                            className="rounded-md border border-[var(--app-line)] px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          >
                            {jobStatusLabels[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    조건에 맞는 공고가 없습니다.
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

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="공고 상태 변경"
        description={
          pendingStatus
            ? `"${pendingStatus.job.title}" 상태를 "${jobStatusLabels[pendingStatus.status]}"로 변경합니다.`
            : ""
        }
        confirmLabel="변경"
        onConfirm={applyStatusChange}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
