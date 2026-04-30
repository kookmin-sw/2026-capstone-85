"use client";

import { Building2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { authRequest, type AuthUser } from "@/lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<AuthUser["role"]>("JOB_SEEKER");
  const [username, setUsername] = useState("jobseeker");
  const [password, setPassword] = useState("password123");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const payload: Record<string, string> = { username, password };
      if (mode === "register") {
        payload.role = role;
        if (displayName) payload.displayName = displayName;
        if (role === "COMPANY") payload.companyName = companyName;
      }
      const user = await authRequest(mode, payload);
      setMessage(`${user?.username} 계정으로 로그인되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청에 실패했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-8">
      <div className="mx-auto max-w-xl border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
        <Link href="/" className="text-sm font-medium text-[var(--brand)]">
          ← 공고 목록
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">로그인 / 회원가입</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          개인회원, 기업회원, 관리자 계정을 아이디와 비밀번호로 테스트합니다.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              mode === "login" ? "border-[var(--brand)] bg-teal-50" : "border-[var(--app-line)]"
            }`}
            onClick={() => setMode("login")}
          >
            <LogIn className="mr-2 inline" size={16} />
            로그인
          </button>
          <button
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              mode === "register" ? "border-[var(--brand)] bg-teal-50" : "border-[var(--app-line)]"
            }`}
            onClick={() => setMode("register")}
          >
            <UserPlus className="mr-2 inline" size={16} />
            회원가입
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <label className="text-sm font-medium">
            아이디
            <input
              className="mt-2 w-full border border-[var(--app-line)] px-3 py-2"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            비밀번호
            <input
              className="mt-2 w-full border border-[var(--app-line)] px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {mode === "register" && (
            <>
              <label className="text-sm font-medium">
                회원 유형
                <select
                  className="mt-2 w-full border border-[var(--app-line)] px-3 py-2"
                  value={role}
                  onChange={(event) => setRole(event.target.value as AuthUser["role"])}
                >
                  <option value="JOB_SEEKER">개인회원</option>
                  <option value="COMPANY">기업회원</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                표시 이름
                <input
                  className="mt-2 w-full border border-[var(--app-line)] px-3 py-2"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
              {role === "COMPANY" && (
                <label className="text-sm font-medium">
                  회사명
                  <input
                    className="mt-2 w-full border border-[var(--app-line)] px-3 py-2"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="예: 한빛회계법인"
                  />
                </label>
              )}
            </>
          )}

          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 py-3 font-semibold text-white">
            <Building2 size={18} />
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        {message && (
          <div className="mt-4 border border-[var(--app-line)] bg-[#fbfbf8] p-3 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
