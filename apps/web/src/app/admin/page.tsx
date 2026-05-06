"use client";

import { BriefcaseBusiness, Building2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/admin/status-badge";
import {
  fetchAdminDashboard,
  type AdminDashboard,
} from "@/components/admin/admin-demo-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    fetchAdminDashboard()
      .then((data) => {
        if (!ignore) {
          setDashboard(data);
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
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">대시보드를 불러오는 중입니다.</div>;
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || "대시보드를 불러오지 못했습니다."}
      </div>
    );
  }

  const cards = [
    {
      label: "공고 수",
      value: dashboard.counts.jobs,
      icon: BriefcaseBusiness,
    },
    { label: "회사 수", value: dashboard.counts.companies, icon: Building2 },
    { label: "회원 수", value: dashboard.counts.members, icon: Users },
    {
      label: "게시중 공고",
      value: dashboard.counts.jobsByStatus.OPEN,
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-lg border border-[var(--app-line)] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                <Icon size={18} className="text-[var(--proto-brand)]" />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {card.value.toLocaleString("ko-KR")}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--app-line)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--app-line)] px-5 py-4">
            <h2 className="text-sm font-bold">최근 등록된 공고</h2>
            <Link
              href="/admin/jobs"
              className="text-xs font-semibold text-[var(--proto-brand)]"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-[var(--app-line)]">
            {dashboard.recentJobs.length ? (
              dashboard.recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className="grid gap-1 px-5 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{job.title}</p>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {job.companyName} · {formatDate(job.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                등록된 공고가 없습니다.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--app-line)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--app-line)] px-5 py-4">
            <h2 className="text-sm font-bold">최근 등록된 회사</h2>
            <Link
              href="/admin/companies"
              className="text-xs font-semibold text-[var(--proto-brand)]"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-[var(--app-line)]">
            {dashboard.recentCompanies.length ? (
              dashboard.recentCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/admin/companies/${company.id}`}
                  className="grid gap-1 px-5 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">
                      {company.name}
                    </p>
                    <span className="text-xs font-semibold text-gray-500">
                      공고 {company.jobCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {company.type} · {formatDate(company.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                등록된 회사가 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
