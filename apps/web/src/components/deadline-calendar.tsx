"use client";

import type {
  JobCalendarDay,
  JobCalendarEvent,
  JobCalendarEventType,
  JobCalendarRange,
  JobListItem,
} from "@cpa/shared";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  daysBetween,
  fromDateKey,
  getCalendarGridDays,
  isSameDay,
  toDateKey,
} from "@/lib/date-utils";
import { Badge, CompactJobRow, deadlineText } from "./job-card";

const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];
const miniDotLimit = 4;
const fullCalendarRangeLimit = 3;
type CalendarModalEntryType = JobCalendarEventType | "ONGOING";

const calendarEventMeta: Record<
  CalendarModalEntryType,
  { label: string; barClassName: string; badgeTone?: "teal" }
> = {
  START: {
    label: "시작",
    barClassName: "border-sky-200 bg-sky-50 text-sky-950",
  },
  DEADLINE: {
    label: "마감",
    barClassName: "border-rose-200 bg-rose-50 text-rose-950",
    badgeTone: "teal",
  },
  ONGOING: {
    label: "진행 중",
    barClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
};

type CalendarModalEntry = {
  date: string;
  type: CalendarModalEntryType;
  job: JobListItem;
};

type CalendarRangeSegment = {
  range: JobCalendarRange;
  lane: number;
  startColumn: number;
  endColumn: number;
  startsAtRangeStart: boolean;
  endsAtRangeEnd: boolean;
};

export function MiniDeadlineCalendar({
  monthDate,
  dayMap,
  weekJobs,
  calendarHref,
  onMonthChange,
}: {
  monthDate: Date;
  dayMap: Record<string, JobCalendarDay>;
  weekJobs: JobListItem[];
  calendarHref: string;
  onMonthChange: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = useMemo(() => getCalendarGridDays(monthDate), [monthDate]);

  return (
    <section className="grid gap-4 border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays size={18} />
            마감 미니캘린더
          </h3>
          <p className="text-sm text-[var(--app-muted)]">
            고정 마감일이 있는 공고만 표시됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
              )
            }
            className="rounded-md border border-[var(--app-line)] p-2"
            aria-label="이전 달"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="min-w-24 text-center text-sm font-semibold">
            {monthDate.getFullYear()}. {monthDate.getMonth() + 1}.
          </p>
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
              )
            }
            className="rounded-md border border-[var(--app-line)] p-2"
            aria-label="다음 달"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekLabels.map((label) => (
          <div key={label} className="py-1 font-semibold text-[var(--app-muted)]">
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const calendarDay = dayMap[dateKey];
          const inMonth = day.getMonth() === monthDate.getMonth();
          const deadlineCount = calendarDay?.total ?? 0;
          const dots = Math.min(deadlineCount, miniDotLimit);
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              aria-label={`${dateKey} 마감 공고 ${deadlineCount}건`}
              className={
                inMonth
                  ? "min-h-16 border border-[var(--app-line)] bg-white p-1 text-left hover:border-[var(--brand)]"
                  : "min-h-16 border border-transparent bg-[#fbfbf8] p-1 text-left text-neutral-400"
              }
            >
              <span
                className={
                  isSameDay(day, new Date())
                    ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white"
                    : "text-xs font-semibold"
                }
              >
                {day.getDate()}
              </span>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: dots }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-teal-600"
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 border-t border-[var(--app-line)] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold">이번 주 마감 공고</h4>
          <Link
            href={calendarHref}
            className="text-sm font-semibold text-[var(--brand)]"
          >
            전체 캘린더 보기
          </Link>
        </div>
        {weekJobs.length ? (
          <div className="grid gap-2">
            {weekJobs.slice(0, 5).map((job) => (
              <CompactJobRow key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-[var(--app-line)] bg-[#fbfbf8] p-4 text-sm text-[var(--app-muted)]">
            이번 주에 고정 마감일이 있는 공고가 없습니다.
          </p>
        )}
      </div>

      {selectedDate && (
        <CalendarDayModal
          date={selectedDate}
          jobs={dayMap[selectedDate]?.jobs ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </section>
  );
}

export function FullDeadlineCalendar({
  monthDate,
  dayMap,
  eventMap,
  ranges,
  onMonthChange,
}: {
  monthDate: Date;
  dayMap: Record<string, JobCalendarDay>;
  eventMap: Record<string, JobCalendarEvent[]>;
  ranges: JobCalendarRange[];
  onMonthChange: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = useMemo(() => getCalendarGridDays(monthDate), [monthDate]);
  const weeks = useMemo(() => chunkCalendarWeeks(days), [days]);
  const rangeSegments = useMemo(
    () => buildCalendarRangeSegments(weeks, ranges),
    [ranges, weeks],
  );
  const rangesByDate = useMemo(
    () => buildCalendarRangesByDate(days, ranges),
    [days, ranges],
  );

  return (
    <section className="grid gap-4 border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">채용 캘린더</h1>
          <p className="text-sm text-[var(--app-muted)]">
            필터에 맞는 공고의 시작 일정과 마감 일정을 함께 확인하세요.
          </p>
        </div>
        <div className="grid gap-3 sm:justify-items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onMonthChange(
                  new Date(
                    monthDate.getFullYear(),
                    monthDate.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="rounded-md border border-[var(--app-line)] p-2"
              aria-label="이전 달"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="min-w-32 text-center font-semibold">
              {monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월
            </p>
            <button
              type="button"
              onClick={() =>
                onMonthChange(
                  new Date(
                    monthDate.getFullYear(),
                    monthDate.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="rounded-md border border-[var(--app-line)] p-2"
              aria-label="다음 달"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-950">
              공고 기간
            </span>
            <span className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-rose-950">
              마감 지점
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[820px] border-l border-t border-[var(--app-line)] text-sm">
          <div className="grid grid-cols-7">
            {weekLabels.map((label) => (
              <div
                key={label}
                className="border-b border-r border-[var(--app-line)] bg-[#fbfbf8] px-2 py-2 text-center font-semibold text-[var(--app-muted)]"
              >
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div
              key={toDateKey(week[0])}
              className="relative grid grid-cols-7 border-b border-[var(--app-line)]"
            >
              {week.map((day) => {
                const dateKey = toDateKey(day);
                const activeRanges = rangesByDate[dateKey] ?? [];
                const inMonth = day.getMonth() === monthDate.getMonth();
                const overflow = Math.max(
                  activeRanges.length - fullCalendarRangeLimit,
                  0,
                );

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(dateKey)}
                    aria-label={`${dateKey} 채용 기간 ${activeRanges.length}건`}
                    className={
                      inMonth
                        ? "relative min-h-44 border-r border-[var(--app-line)] bg-white p-2 text-left align-top hover:bg-teal-50/40"
                        : "relative min-h-44 border-r border-[var(--app-line)] bg-[#fbfbf8] p-2 text-left text-neutral-400"
                    }
                  >
                    <span
                      className={
                        isSameDay(day, new Date())
                          ? "relative z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white"
                          : "relative z-20 text-xs font-semibold"
                      }
                    >
                      {day.getDate()}
                    </span>
                    {overflow > 0 && (
                      <span className="absolute bottom-2 left-2 z-20 text-xs font-semibold text-[var(--brand)]">
                        +{overflow}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pointer-events-none absolute inset-x-0 top-11 z-10 grid grid-cols-7 gap-y-1">
                {(rangeSegments[weekIndex] ?? []).map((segment) => (
                  <div
                    key={`${segment.range.job.id}-${segment.startColumn}-${segment.endColumn}`}
                    className={`mx-1 flex h-7 items-center overflow-hidden border px-2 text-xs font-semibold shadow-sm ${rangeSegmentClassName(segment)}`}
                    style={{
                      gridColumn: `${segment.startColumn + 1} / ${
                        segment.endColumn + 2
                      }`,
                      gridRow: segment.lane + 1,
                    }}
                    aria-hidden="true"
                  >
                    <span className="truncate">
                      {rangeSegmentLabel(segment)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <CalendarDayModal
          date={selectedDate}
          jobs={dayMap[selectedDate]?.jobs ?? []}
          events={buildModalEntries(
            selectedDate,
            eventMap[selectedDate] ?? [],
            rangesByDate[selectedDate] ?? [],
          )}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </section>
  );
}

function chunkCalendarWeeks(days: Date[]) {
  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

function buildCalendarRangeSegments(
  weeks: Date[][],
  ranges: JobCalendarRange[],
) {
  return weeks.map((week) => {
    const weekStart = week[0];
    const weekEnd = week[week.length - 1];
    const activeRanges = ranges
      .filter((range) => rangeIntersectsDates(range, weekStart, weekEnd))
      .sort(compareCalendarRanges)
      .slice(0, fullCalendarRangeLimit);

    return activeRanges.map<CalendarRangeSegment>((range, lane) => {
      const rangeStart = fromDateKey(range.startDate);
      const rangeEnd = fromDateKey(range.endDate ?? range.startDate);
      const segmentStart =
        rangeStart.getTime() > weekStart.getTime() ? rangeStart : weekStart;
      const segmentEnd =
        rangeEnd.getTime() < weekEnd.getTime() ? rangeEnd : weekEnd;

      return {
        range,
        lane,
        startColumn: daysBetween(weekStart, segmentStart),
        endColumn: daysBetween(weekStart, segmentEnd),
        startsAtRangeStart: toDateKey(segmentStart) === range.startDate,
        endsAtRangeEnd:
          toDateKey(segmentEnd) === (range.endDate ?? range.startDate),
      };
    });
  });
}

function buildCalendarRangesByDate(
  days: Date[],
  ranges: JobCalendarRange[],
) {
  return days.reduce<Record<string, JobCalendarRange[]>>((acc, day) => {
    const dateKey = toDateKey(day);
    acc[dateKey] = ranges
      .filter((range) => rangeContainsDateKey(range, dateKey))
      .sort(compareCalendarRanges);
    return acc;
  }, {});
}

function buildModalEntries(
  date: string,
  events: JobCalendarEvent[],
  activeRanges: JobCalendarRange[],
): CalendarModalEntry[] {
  const entries: CalendarModalEntry[] = events.map((event) => ({
    date: event.date,
    type: event.type,
    job: event.job,
  }));
  const eventJobIds = new Set(entries.map((event) => event.job.id));

  for (const range of activeRanges) {
    if (eventJobIds.has(range.job.id)) continue;
    entries.push({ date, type: "ONGOING", job: range.job });
  }

  return entries.sort((first, second) => {
    const typeOrder =
      modalEntryTypeOrder(first.type) - modalEntryTypeOrder(second.type);
    if (typeOrder !== 0) return typeOrder;
    return first.job.title.localeCompare(second.job.title);
  });
}

function compareCalendarRanges(
  first: JobCalendarRange,
  second: JobCalendarRange,
) {
  const startOrder = first.startDate.localeCompare(second.startDate);
  if (startOrder !== 0) return startOrder;
  const firstEnd = first.endDate ?? first.startDate;
  const secondEnd = second.endDate ?? second.startDate;
  const endOrder = firstEnd.localeCompare(secondEnd);
  if (endOrder !== 0) return endOrder;
  return first.job.title.localeCompare(second.job.title);
}

function rangeIntersectsDates(
  range: JobCalendarRange,
  from: Date,
  to: Date,
) {
  const rangeStart = fromDateKey(range.startDate);
  const rangeEnd = fromDateKey(range.endDate ?? range.startDate);
  return rangeStart.getTime() <= to.getTime() && rangeEnd.getTime() >= from.getTime();
}

function rangeContainsDateKey(range: JobCalendarRange, dateKey: string) {
  const value = fromDateKey(dateKey).getTime();
  const rangeStart = fromDateKey(range.startDate).getTime();
  const rangeEnd = fromDateKey(range.endDate ?? range.startDate).getTime();
  return value >= rangeStart && value <= rangeEnd;
}

function rangeSegmentClassName(segment: CalendarRangeSegment) {
  const rangeHasDeadline = segment.range.endDate !== null;
  const colorClassName = rangeHasDeadline
    ? "border-emerald-200 bg-gradient-to-r from-sky-50 via-emerald-50 to-rose-50 text-emerald-950"
    : "border-sky-200 bg-sky-50 text-sky-950";

  if (segment.startsAtRangeStart && segment.endsAtRangeEnd) {
    return `rounded-md ${colorClassName}`;
  }

  const leftRadius = segment.startsAtRangeStart ? "rounded-l-md" : "rounded-l-none";
  const rightRadius = segment.endsAtRangeEnd ? "rounded-r-md" : "rounded-r-none";
  return `${leftRadius} ${rightRadius} ${colorClassName}`;
}

function rangeSegmentLabel(segment: CalendarRangeSegment) {
  const title = segment.range.job.title;
  if (!segment.range.endDate) return `시작 · ${title}`;
  if (segment.startsAtRangeStart && segment.endsAtRangeEnd) {
    return `시작-마감 · ${title}`;
  }
  if (segment.startsAtRangeStart) return `시작 · ${title}`;
  if (segment.endsAtRangeEnd) return `마감 · ${title}`;
  return `진행 · ${title}`;
}

function modalEntryTypeOrder(type: CalendarModalEntryType) {
  if (type === "START") return 0;
  if (type === "ONGOING") return 1;
  return 2;
}

function CalendarDayModal({
  date,
  jobs,
  events,
  onClose,
}: {
  date: string;
  jobs: JobListItem[];
  events?: CalendarModalEntry[];
  onClose: () => void;
}) {
  const hasEvents = events !== undefined;
  const modalEvents =
    events ??
    jobs.map((job) => ({
      date,
      type: "DEADLINE" as const,
      job,
    }));
  const count = hasEvents ? modalEvents.length : jobs.length;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${date} 채용 일정`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--app-line)] px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">{formatModalDate(date)}</h2>
            <p className="text-sm text-[var(--app-muted)]">
              {hasEvents ? "채용 일정" : "마감 공고"}{" "}
              {count.toLocaleString("ko-KR")}건
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-neutral-100"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid max-h-[65vh] gap-2 overflow-y-auto p-5">
          {modalEvents.length ? (
            modalEvents.map((event) => (
              <CalendarEventDetail
                key={`${event.type}-${event.job.id}`}
                event={event}
              />
            ))
          ) : (
            <p className="border border-dashed border-[var(--app-line)] bg-[#fbfbf8] p-5 text-sm text-[var(--app-muted)]">
              이 날짜에 표시할 채용 일정이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarEventDetail({ event }: { event: CalendarModalEntry }) {
  const meta = calendarEventMeta[event.type];

  return (
    <article className={`grid gap-3 border p-3 ${meta.barClassName}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.badgeTone}>{meta.label}</Badge>
        <Badge>{deadlineText(event.job)}</Badge>
        <span className="text-xs font-medium text-[var(--app-muted)]">
          {event.job.companyName}
        </span>
      </div>
      <div className="grid gap-1">
        <Link
          href={`/jobs/${event.job.id}`}
          className="font-semibold text-[var(--foreground)] hover:text-[var(--brand)]"
        >
          {event.job.title}
        </Link>
        <p className="text-sm text-[var(--app-muted)]">
          출처: {event.job.sourceName} · 최종 확인:{" "}
          {new Date(event.job.lastCheckedAt).toLocaleString("ko-KR")}
        </p>
      </div>
    </article>
  );
}

function formatModalDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
