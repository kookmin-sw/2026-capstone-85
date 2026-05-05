"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { fetchCompanies, fetchJobs } from "@/lib/api";
import {
  buildJobFilterParams,
  quickFilterState,
  quickJobFilters,
} from "@/lib/job-filters";

export default function Home() {
  const [jobTotal, setJobTotal] = useState(0);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [companyOpenTotal, setCompanyOpenTotal] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchJobs(new URLSearchParams({ pageSize: "1" }))
      .then((data) => {
        if (!ignore) setJobTotal(data.total);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchCompanies(new URLSearchParams({ pageSize: "1" }))
      .then((data) => {
        if (!ignore) {
          setCompanyTotal(data.total);
          setCompanyOpenTotal(data.openTotal);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNav />

      {/* HERO */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#fff5f8 0%,#ffe8f0 50%,#fff0f5 100%)",
          minHeight: "460px",
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(232,69,122,.08) 0%,transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(232,69,122,.06) 0%,transparent 70%)",
          }}
        />
        <div className="mx-auto flex w-full max-w-7xl items-center gap-10 px-6 py-16">
          <div className="max-w-xl flex-1">
            <span
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{
                background: "var(--proto-brand-light)",
                borderColor: "var(--proto-brand-mid)",
                color: "var(--proto-brand)",
              }}
            >
              CPA 전용 채용 큐레이션 플랫폼
            </span>
            <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight text-gray-900">
              회계사 채용,
              <br />
              <span style={{ color: "var(--proto-brand)" }}>
                더 빠르고 정확하게
              </span>
            </h1>
            <p className="mb-8 text-base leading-loose text-gray-500">
              회계사 채용 공고를 한 곳에 모아, 필요한 기준으로 정리해드립니다.
              <br />
              마감일, 수습 가능 여부, 직무군, 연차 등으로 맞춤 검색하세요.
            </p>
            <div className="flex gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--proto-brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--proto-brand-dark)] hover:shadow-md"
              >
                공고 보기
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--brand)] transition-all hover:bg-[var(--proto-brand-light)] hover:shadow-sm"
              >
                회사 탐색
              </Link>
            </div>
          </div>
          <div className="relative hidden h-80 flex-1 items-center justify-center lg:flex">
            <span
              className="absolute left-[10%] top-[10%] text-5xl"
              style={{ animation: "float1 4s ease-in-out infinite" }}
            >
              📅
            </span>
            <span
              className="absolute right-[10%] top-[20%] text-4xl"
              style={{ animation: "float2 5s ease-in-out infinite" }}
            >
              👤
            </span>
            <span
              className="absolute bottom-[25%] left-[5%] text-4xl"
              style={{ animation: "float3 6s ease-in-out infinite" }}
            >
              🔍
            </span>
            <span
              className="absolute bottom-[20%] right-[5%] text-5xl"
              style={{ animation: "float1 5.5s ease-in-out infinite" }}
            >
              📊
            </span>
            <span
              className="text-6xl"
              style={{ animation: "float2 4.5s ease-in-out infinite" }}
            >
              📋
            </span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-[var(--app-line)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[var(--app-line)] md:grid-cols-4">
          <StatItem
            emoji="💼"
            value={
              jobTotal > 0 ? `${jobTotal.toLocaleString("ko-KR")}+` : "..."
            }
            label="진행 중인 공고"
          />
          <StatItem
            emoji="🏢"
            value={
              companyTotal > 0
                ? `${companyTotal.toLocaleString("ko-KR")}+`
                : "..."
            }
            label="참여 기업"
          />
          <StatItem
            emoji="✅"
            value={
              companyOpenTotal > 0
                ? `${companyOpenTotal.toLocaleString("ko-KR")}+`
                : "..."
            }
            label="채용 중인 기업"
          />
          <StatItem emoji="⏰" value="D-7" label="이번 주 마감 임박" />
        </div>
      </section>

      {/* QUICK FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">빠른 탐색</h2>
          <p className="mb-6 text-sm text-gray-400">
            원하는 공고를 빠르게 찾아보세요
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {quickJobFilters.map((filter) => {
              const params = buildJobFilterParams(
                quickFilterState(filter.values),
              );
              return (
                <QuickFilterCard
                  key={filter.label}
                  label={filter.label}
                  href={`/jobs?${params.toString()}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
      `}</style>
    </main>
  );
}

const quickFilterMeta: Record<string, { emoji: string; desc: string }> = {
  "수습 CPA": { emoji: "🎓", desc: "수습 가능한 공고만 보기" },
  신입: { emoji: "✨", desc: "신입 채용 공고 보기" },
  "주니어 이직": { emoji: "💼", desc: "1~3년차 이직 공고 보기" },
  "경력 이직": { emoji: "🏆", desc: "4년차 이상 경력 채용" },
  "마감 임박": { emoji: "⏰", desc: "D-7 이내 마감 공고 보기" },
};

function QuickFilterCard({ label, href }: { label: string; href: string }) {
  const meta = quickFilterMeta[label] ?? { emoji: "🔍", desc: label };
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-[var(--app-line)] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--proto-brand)] hover:bg-[var(--proto-brand-light)] hover:shadow-md"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: "var(--proto-brand-light)" }}
      >
        {meta.emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{meta.desc}</p>
      </div>
      <ArrowRight
        size={15}
        className="shrink-0 text-gray-300 transition-colors group-hover:text-[var(--proto-brand)]"
      />
    </Link>
  );
}

function StatItem({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 px-8 py-6">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: "var(--proto-brand-light)" }}
      >
        {emoji}
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
