"use client";

import { Building2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { authRequest, type AuthUser } from "@/lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<AuthUser["role"]>("JOB_SEEKER");
  const [username, setUsername] = useState("test002");
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
      setMessage(
        error instanceof Error ? error.message : "요청에 실패했습니다.",
      );
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg,#fff5f8 0%,#ffe8f0 50%,#fff0f5 100%)",
      }}
    >
      {/* Logo / back link */}
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-gray-900"
          >
            Account<span style={{ color: "var(--proto-brand)" }}>it</span>
          </Link>
          <p className="mt-1 text-sm text-gray-500">
            CPA 전용 채용 큐레이션 플랫폼
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--app-line)] bg-white p-8 shadow-sm">
          {/* Mode tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors"
              style={
                mode === "login"
                  ? {
                      background: "var(--proto-brand-light)",
                      borderColor: "var(--proto-brand)",
                      color: "var(--proto-brand)",
                    }
                  : { borderColor: "var(--app-line)" }
              }
              onClick={() => setMode("login")}
            >
              <LogIn size={16} />
              로그인
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors"
              style={
                mode === "register"
                  ? {
                      background: "var(--proto-brand-light)",
                      borderColor: "var(--proto-brand)",
                      color: "var(--proto-brand)",
                    }
                  : { borderColor: "var(--app-line)" }
              }
              onClick={() => setMode("register")}
            >
              <UserPlus size={16} />
              회원가입
            </button>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="text-sm font-semibold text-gray-700">
              아이디
              <input
                className="mt-2 w-full rounded-xl border border-[var(--app-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              비밀번호
              <input
                className="mt-2 w-full rounded-xl border border-[var(--app-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {mode === "register" && (
              <>
                <label className="text-sm font-semibold text-gray-700">
                  회원 유형
                  <select
                    className="mt-2 w-full rounded-xl border border-[var(--app-line)] px-3 py-2.5 text-sm outline-none"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as AuthUser["role"])
                    }
                  >
                    <option value="JOB_SEEKER">개인회원</option>
                    <option value="COMPANY">기업회원</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  표시 이름
                  <input
                    className="mt-2 w-full rounded-xl border border-[var(--app-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </label>
                {role === "COMPANY" && (
                  <label className="text-sm font-semibold text-gray-700">
                    회사명
                    <input
                      className="mt-2 w-full rounded-xl border border-[var(--app-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="예: 한빛회계법인"
                    />
                  </label>
                )}
              </>
            )}

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--proto-brand)" }}
            >
              <Building2 size={17} />
              {mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-xl border border-[var(--app-line)] bg-[#fbfbf8] p-3 text-sm text-gray-700">
              {message}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">
            ← 공고 목록으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
