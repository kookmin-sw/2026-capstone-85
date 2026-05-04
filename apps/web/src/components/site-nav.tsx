"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", key: "home" },
  { href: "/jobs", label: "채용공고", key: "jobs" },
  { href: "/companies", label: "회사소개", key: "companies" },
  { href: "/calendar", label: "마감일 캘린더", key: "calendar" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--app-line)] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-gray-900">
          Account<span style={{ color: "var(--proto-brand)" }}>it</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--proto-brand)" : undefined,
                  fontWeight: active ? 600 : undefined,
                }}
              >
                <span className={active ? "" : "text-gray-500 hover:text-gray-800"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="ml-auto">
          <Link
            href="/login"
            className="rounded-xl bg-[var(--proto-brand)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--proto-brand-dark)] hover:shadow-md"
          >
            로그인 / 회원가입
          </Link>
        </div>
      </div>
    </nav>
  );
}
