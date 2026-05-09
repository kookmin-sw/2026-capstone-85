import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { CompanyDetailClient } from "./company-detail-client";

function DetailFallback() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="animate-pulse rounded-2xl border border-[var(--app-line)] bg-white p-6 text-sm text-[var(--app-muted)]">
          회사 상세를 불러오는 중입니다.
        </div>
      </div>
    </main>
  );
}

export default function CompanyDetailPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <CompanyDetailClient />
    </Suspense>
  );
}
