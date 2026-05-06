"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginAdminDemo } from "@/components/admin/admin-demo-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("test001");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await loginAdminDemo(username, password);
      router.replace("/admin");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "관리자 로그인에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <p className="text-2xl font-black tracking-tight text-gray-900">
            Account<span className="text-[var(--proto-brand)]">it</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">prototype admin</p>
        </div>

        <div className="rounded-lg border border-[var(--app-line)] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={22} className="text-[var(--proto-brand)]" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">관리자 로그인</h1>
              <p className="text-xs text-gray-400">test 계정 전용 접근</p>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="text-sm font-semibold text-gray-700">
              아이디
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm outline-none focus:border-[var(--proto-brand)]"
                autoComplete="username"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              비밀번호
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm outline-none focus:border-[var(--proto-brand)]"
                type="password"
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-lg bg-[var(--proto-brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--proto-brand-dark)] disabled:opacity-60"
            >
              {submitting ? "확인 중" : "로그인"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
