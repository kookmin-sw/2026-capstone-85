"use client";

import type {
  JobCalendarDay,
  JobCalendarEvent,
  JobCalendarRange,
} from "@cpa/shared";
import { Filter, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FullDeadlineCalendar } from "@/components/deadline-calendar";
import { JobFilterPanel } from "@/components/job-filter-panel";
import { useJobFilterState } from "@/hooks/use-job-filter-state";
import { fetchJobCalendar } from "@/lib/api";
import { calendarDaysToMap, calendarEventsToMap } from "@/lib/calendar-data";
import { getCalendarGridRange, toDateKey } from "@/lib/date-utils";
import { buildJobFilterParams } from "@/lib/job-filters";

export default function CalendarPage() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [calendarDays, setCalendarDays] = useState<JobCalendarDay[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<JobCalendarEvent[]>([]);
  const [calendarRanges, setCalendarRanges] = useState<JobCalendarRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { filters, setFilters, ready, queryString } = useJobFilterState();

  const calendarRange = useMemo(
    () => getCalendarGridRange(monthDate),
    [monthDate],
  );

  const calendarParams = useMemo(() => {
    const next = buildJobFilterParams(filters);
    next.set("from", toDateKey(calendarRange.from));
    next.set("to", toDateKey(calendarRange.to));
    return next;
  }, [calendarRange, filters]);

  useEffect(() => {
    if (!ready) return;
    let ignore = false;
    fetchJobCalendar(calendarParams)
      .then((data) => {
        if (!ignore) {
          setCalendarDays(data.days);
          setCalendarEvents(data.events ?? []);
          setCalendarRanges(data.ranges ?? []);
          setError("");
        }
      })
      .catch((caught: Error) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [calendarParams, ready]);

  const dayMap = useMemo(() => calendarDaysToMap(calendarDays), [calendarDays]);
  const eventMap = useMemo(
    () => calendarEventsToMap(calendarEvents),
    [calendarEvents],
  );
  const homeHref = `/${queryString ? `?${queryString}` : ""}`;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--app-line)] bg-[var(--app-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--brand)]">CPA Jobs</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              전체 마감 캘린더
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--app-line)] px-3 py-2 text-sm font-medium"
            >
              <Home size={16} /> 홈
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
            >
              <LogIn size={16} />
              로그인
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Filter size={16} />
            캘린더 필터
          </div>
          <JobFilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <div className="grid gap-4">
          {error && (
            <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error} 캘린더 API 서버를 확인해 주세요.
            </div>
          )}
          {loading ? (
            <div className="border border-[var(--app-line)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-muted)]">
              캘린더를 불러오는 중입니다.
            </div>
          ) : (
            <FullDeadlineCalendar
              monthDate={monthDate}
              dayMap={dayMap}
              eventMap={eventMap}
              ranges={calendarRanges}
              onMonthChange={setMonthDate}
            />
          )}
        </div>
      </section>
    </main>
  );
}
