"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { ActionLink } from "@/components/ui/action-button";
import { IconTile } from "@/components/ui/icon-tile";
import { fetchCompanies, fetchJobs } from "@/lib/api";
import {
  buildJobFilterParams,
  quickFilterState,
  quickJobFilters,
} from "@/lib/job-filters";
import styles from "./page.module.css";

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
    <main className={styles.page}>
      <SiteNav />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={14} />
              CPA 전용 채용 큐레이션 플랫폼
            </span>
            <h1 className={styles.headline}>
              회계사 채용,
              <br />
              <span className={styles.headlineAccent}>
                더 빠르고 정확하게
              </span>
            </h1>
            <p className={styles.description}>
              회계사 채용 공고를 한곳에 모아 마감일, 수습 가능 여부,
              KICPA 조건, 직무군, 회사 유형 기준으로 탐색할 수 있게
              정리합니다.
            </p>
            <div className={styles.actions}>
              <ActionLink
                href="/jobs"
                size="lg"
                iconStart={<Search size={17} />}
                iconEnd={<ArrowRight size={17} />}
              >
                공고 보기
              </ActionLink>
              <ActionLink href="/companies" size="lg" variant="outline">
                회사 탐색
              </ActionLink>
            </div>
          </div>

          <div className={styles.heroPanel} aria-label="서비스 요약">
            <HeroMetric
              icon={BriefcaseBusiness}
              value={jobTotal > 0 ? jobTotal.toLocaleString("ko-KR") : "..."}
              label="진행 중인 공고"
            />
            <HeroMetric
              icon={Building2}
              value={
                companyTotal > 0 ? companyTotal.toLocaleString("ko-KR") : "..."
              }
              label="등록된 회사"
            />
            <HeroMetric
              icon={CheckCircle2}
              value={
                companyOpenTotal > 0
                  ? companyOpenTotal.toLocaleString("ko-KR")
                  : "..."
              }
              label="채용 중인 회사"
            />
            <HeroMetric icon={CalendarClock} value="D-7" label="마감 임박" />
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <StatItem
            icon={BriefcaseBusiness}
            value={jobTotal > 0 ? `${jobTotal.toLocaleString("ko-KR")}+` : "..."}
            label="진행 중인 공고"
          />
          <StatItem
            icon={Building2}
            value={
              companyTotal > 0
                ? `${companyTotal.toLocaleString("ko-KR")}+`
                : "..."
            }
            label="참여 기업"
          />
          <StatItem
            icon={CheckCircle2}
            value={
              companyOpenTotal > 0
                ? `${companyOpenTotal.toLocaleString("ko-KR")}+`
                : "..."
            }
            label="채용 중인 기업"
          />
          <StatItem icon={CalendarClock} value="D-7" label="이번 주 마감 임박" />
        </div>
      </section>

      <section className={styles.quickSection}>
        <div className={styles.quickPanel}>
          <h2 className={styles.sectionTitle}>빠른 탐색</h2>
          <p className={styles.sectionDescription}>
            원하는 조건의 공고를 바로 확인해보세요.
          </p>
          <div className={styles.quickGrid}>
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
    </main>
  );
}

const quickFilterMeta = {
  "수습 CPA": {
    icon: GraduationCap,
    desc: "수습 가능한 공고만 보기",
  },
  신입: {
    icon: Sparkles,
    desc: "신입 채용 공고 보기",
  },
  "주니어 이직": {
    icon: BriefcaseBusiness,
    desc: "1~3년차 이직 공고 보기",
  },
  "경력 이직": {
    icon: Trophy,
    desc: "4년차 이상 경력 채용",
  },
  "마감 임박": {
    icon: CalendarClock,
    desc: "D-7 이내 마감 공고 보기",
  },
} as const;

function QuickFilterCard({ label, href }: { label: string; href: string }) {
  const meta =
    quickFilterMeta[label as keyof typeof quickFilterMeta] ?? {
      icon: Search,
      desc: label,
    };
  return (
    <Link href={href} className={styles.quickCard}>
      <IconTile icon={meta.icon} />
      <div className={styles.quickCardText}>
        <p className={styles.quickCardTitle}>{label}</p>
        <p className={styles.quickCardDescription}>{meta.desc}</p>
      </div>
      <ArrowRight size={15} className={styles.quickArrow} />
    </Link>
  );
}

function HeroMetric({
  icon,
  value,
  label,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
  label: string;
}) {
  return (
    <div className={styles.heroMetric}>
      <IconTile icon={icon} size="lg" />
      <p className={styles.metricValue}>{value}</p>
      <p className={styles.metricLabel}>{label}</p>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
  label: string;
}) {
  return (
    <div className={styles.statItem}>
      <IconTile icon={icon} />
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}
