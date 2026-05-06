"use client";

import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminDemoUser,
  logoutAdminDemo,
  type AdminUser,
} from "@/components/admin/admin-demo-data";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "공고 관리", icon: BriefcaseBusiness },
  { href: "/admin/companies", label: "회사 관리", icon: Building2 },
  { href: "/admin/members", label: "회원 리스트", icon: Users },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;
    let ignore = false;
    const timer = window.setTimeout(() => {
      const nextUser = getAdminDemoUser();
      if (!nextUser) {
        router.replace("/admin/login");
      }
      if (!ignore) {
        setUser(nextUser);
        setChecking(false);
      }
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [isLoginPage, router]);

  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/admin/jobs")) return "공고 관리";
    if (pathname.startsWith("/admin/companies")) return "회사 관리";
    if (pathname.startsWith("/admin/members")) return "회원 리스트";
    return "대시보드";
  }, [pathname]);

  async function logout() {
    await logoutAdminDemo();
    router.replace("/admin/login");
  }

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-gray-500">
        관리자 접근 권한을 확인하는 중입니다.
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-gray-500">
        관리자 로그인 화면으로 이동하는 중입니다.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-gray-900">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-[var(--app-line)] bg-white">
        <div className="flex h-16 items-center border-b border-[var(--app-line)] px-5">
          <div>
            <p className="text-lg font-black tracking-tight">
              Account<span className="text-[var(--proto-brand)]">it</span>
            </p>
            <p className="text-xs font-medium text-gray-400">prototype admin</p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--proto-brand-light)] text-[var(--proto-brand)]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="min-h-screen pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--app-line)] bg-white px-6">
          <div>
            <h1 className="text-lg font-bold">{pageTitle}</h1>
            <p className="text-xs text-gray-400">
              직접 URL로 접근하는 프로토타입 관리자 화면
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.displayName ?? user?.username}</p>
              <p className="text-xs text-gray-400">{user?.username}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={15} />
              로그아웃
            </button>
          </div>
        </header>
        <div className="px-6 py-6">{children}</div>
      </section>
    </main>
  );
}
