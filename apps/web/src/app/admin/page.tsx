"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { fetchAdminHealth } from "@/lib/api";

export default function AdminPage() {
  const [message, setMessage] = useState("아직 확인하지 않았습니다.");

  async function checkAdmin() {
    try {
      const result = await fetchAdminHealth();
      setMessage(result.ok ? "관리자 API 접근이 허용되었습니다." : "관리자 API 응답이 비정상입니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "관리자 API 확인에 실패했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-8">
      <div className="mx-auto max-w-2xl border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
        <Link href="/" className="text-sm font-medium text-[var(--brand)]">
          ← 공고 목록
        </Link>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck size={24} />
          관리자 권한 확인
        </h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          `admin / password123` 계정으로 로그인한 뒤 관리자 API가 열리는지 확인합니다.
        </p>
        <button
          className="mt-5 rounded-md bg-[var(--brand)] px-4 py-3 font-semibold text-white"
          onClick={checkAdmin}
        >
          관리자 API 확인
        </button>
        <div className="mt-4 border border-[var(--app-line)] bg-[#fbfbf8] p-3 text-sm">
          {message}
        </div>
      </div>
    </main>
  );
}
