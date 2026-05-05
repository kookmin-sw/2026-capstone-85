"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionLink } from "@/components/ui/action-button";
import { cn } from "@/lib/utils";
import styles from "./site-nav.module.css";

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
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Account<span className={styles.logoAccent}>it</span>
        </Link>
        <div className={styles.links}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(styles.navLink, active && styles.active)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className={styles.spacer}>
          <ActionLink
            href="/login"
            size="sm"
            iconEnd={<LogIn size={14} />}
          >
            로그인 / 회원가입
          </ActionLink>
        </div>
      </div>
    </nav>
  );
}
