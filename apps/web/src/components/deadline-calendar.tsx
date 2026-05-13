"use client";

import type {
  JobCalendarDay,
  JobCalendarEvent,
  JobCalendarEventType,
  JobCalendarRange,
  JobListItem,
} from "@cpa/shared";
import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  daysBetween,
  fromDateKey,
  getCalendarGridDays,
  getMonthDays,
  isSameDay,
  toDateKey,
} from "@/lib/date-utils";
import { jobDetailHref } from "@/lib/routes";
import { Badge, CompactJobRow, deadlineText } from "./job-card";

const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];
const miniDotLimit = 4;
const fullCalendarRangeLimit = 3;
type CalendarModalEntryType = JobCalendarEventType | "ONGOING";

const calendarEventMeta: Record<
  CalendarModalEntryType,
  { label: string; barClassName: string }
> = {
  START: {
    label: "시작",
    barClassName: "border-gray-200 bg-gray-50 text-gray-800",
  },
  DEADLINE: {
    label: "마감",
    barClassName: "border-gray-200 bg-gray-50 text-gray-800",
  },
  ONGOING: {
    label: "진행 중",
    barClassName: "border-gray-200 bg-gray-50 text-gray-800",
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

type ScrollableCompanyRow = {
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  segments: CalendarRangeSegment[];
  laneCount: number;
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
    <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
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
            className="cursor-pointer rounded-md border border-[var(--app-line)] p-2"
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
            className="cursor-pointer rounded-md border border-[var(--app-line)] p-2"
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
                  ? "min-h-16 cursor-pointer rounded-lg border border-[var(--app-line)] bg-white p-1 text-left transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                  : "min-h-16 cursor-pointer rounded-lg border border-transparent bg-gray-50 p-1 text-left text-gray-300"
              }
            >
              <span
                className={
                  isSameDay(day, new Date())
                    ? "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white"
                    : "cursor-pointer text-xs font-semibold"
                }
              >
                {day.getDate()}
              </span>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: dots }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]"
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
          <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">
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
    <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <div className="relative flex items-center justify-center py-1">
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
            className="cursor-pointer rounded-md border border-[var(--app-line)] p-2"
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
            className="cursor-pointer rounded-md border border-[var(--app-line)] p-2"
            aria-label="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="absolute right-0 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700">
            공고 기간
          </span>
          <span className="rounded-md border border-[var(--brand-mid)] bg-[var(--brand-soft)] px-2.5 py-1 text-[var(--brand)]">
            마감 지점
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[820px] border-l border-t border-[var(--app-line)] text-sm">
          <div className="grid grid-cols-7">
            {weekLabels.map((label) => (
              <div
                key={label}
                className="border-b border-r border-[var(--app-line)] bg-gray-50 px-2 py-2 text-center text-xs font-semibold text-gray-500"
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
                        ? "relative min-h-44 cursor-pointer border-r border-[var(--app-line)] bg-white p-2 text-left align-top transition-colors hover:bg-[#FFF8FA]"
                        : "relative min-h-44 cursor-pointer border-r border-[var(--app-line)] bg-gray-50 p-2 text-left text-gray-300"
                    }
                  >
                    <span
                      className={
                        isSameDay(day, new Date())
                          ? "absolute left-2 top-2 z-20 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white"
                          : "absolute left-2 top-2 z-20 cursor-pointer text-xs font-semibold"
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
                    className={`pointer-events-auto mx-1 flex h-7 cursor-pointer items-center overflow-hidden border px-2 text-xs font-semibold shadow-sm ${rangeSegmentClassName(segment)}`}
                    style={{
                      gridColumn: `${segment.startColumn + 1} / ${
                        segment.endColumn + 2
                      }`,
                      gridRow: segment.lane + 1,
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedDate(dateFromRangeSegmentClick(event, week, segment));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDate(segment.range.endDate ?? segment.range.startDate);
                      }
                    }}
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

export function ScrollableDeadlineCalendar({
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
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const rows = useMemo(
    () => buildScrollableCompanyRows(monthDays, ranges),
    [ranges, monthDays],
  );
  const rangesByDate = useMemo(
    () => buildCalendarRangesByDate(monthDays, ranges),
    [ranges, monthDays],
  );
  const monthStart = monthDays[0];
  const monthEnd = monthDays[monthDays.length - 1];
  const periodLabel = `${formatTimelineHeaderDate(monthStart)} - ${formatTimelineHeaderDate(
    monthEnd,
  )}`;
  const timelineWidth = 230 + monthDays.length * 132;
  const timelineWidthStyle = { minWidth: timelineWidth } satisfies CSSProperties;
  const timelineGridStyle = {
    gridTemplateColumns: `230px repeat(${monthDays.length}, minmax(132px, 132px))`,
  } satisfies CSSProperties;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--app-line)] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-line)] px-5 py-4">
        <div>
          <h2 className="text-xl font-bold text-gray-950">
            {monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월
          </h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(monthDate, -1))}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--app-line)] bg-white transition-colors hover:border-gray-300 hover:bg-gray-50"
            aria-label="이전 달"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="h-10 cursor-pointer rounded-xl border border-[var(--app-line)] bg-white px-4 text-sm font-bold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(monthDate, 1))}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--app-line)] bg-white transition-colors hover:border-gray-300 hover:bg-gray-50"
            aria-label="다음 달"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={timelineWidthStyle}>
          <div
            className="grid border-b border-[var(--app-line)] bg-white text-sm"
            style={timelineGridStyle}
          >
            <div className="sticky left-0 z-30 border-r border-[var(--app-line)] bg-white px-5 py-4 text-sm font-bold text-gray-500">
              기업
            </div>
            {monthDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <button
                  key={toDateKey(day)}
                  type="button"
                  onClick={() => setSelectedDate(toDateKey(day))}
                  className={
                    isToday
                      ? "border-r border-[var(--app-line)] bg-[#fff8fa] px-3 py-3 text-left"
                      : isWeekend
                        ? "border-r border-[var(--app-line)] bg-gray-50 px-3 py-3 text-left hover:bg-gray-100"
                      : "border-r border-[var(--app-line)] bg-white px-3 py-3 text-left hover:bg-gray-50"
                  }
                  aria-label={`${toDateKey(day)} 채용 일정`}
                >
                  <span className="block text-xs font-semibold text-gray-400">
                    {weekLabels[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </span>
                  <span
                    className={
                      isToday
                        ? "mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--brand)] px-2 text-sm font-bold text-white"
                        : "mt-1 block text-lg font-bold text-gray-900"
                    }
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-h-[640px] overflow-y-auto">
            {rows.length ? (
              rows.map((row) => {
                const laneCount = Math.max(row.laneCount, 2);
                const rowGridStyle = {
                  ...timelineGridStyle,
                  gridTemplateRows: `repeat(${laneCount}, 34px)`,
                } satisfies CSSProperties;

                return (
                  <div
                    key={row.companyId}
                    className="grid border-b border-[var(--app-line)] bg-white"
                    style={rowGridStyle}
                  >
                    <div
                      className="sticky left-0 z-20 flex min-w-0 items-center gap-3 border-r border-[var(--app-line)] bg-white px-5"
                      style={{ gridColumn: 1, gridRow: `1 / ${laneCount + 1}` }}
                    >
                      <CompanyLogo
                        name={row.companyName}
                        logoUrl={row.companyLogoUrl}
                      />
                      <span className="truncate text-sm font-bold text-gray-900">
                        {row.companyName}
                      </span>
                    </div>

                    {monthDays.map((day, dayIndex) => {
                      const dateKey = toDateKey(day);
                      const isToday = isSameDay(day, new Date());
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <button
                          key={`${row.companyId}-${dateKey}`}
                          type="button"
                          onClick={() => setSelectedDate(dateKey)}
                          className={
                            isToday
                              ? "border-r border-[var(--app-line)] bg-[#fff8fa]/70"
                              : isWeekend
                                ? "border-r border-[var(--app-line)] bg-gray-50/60 hover:bg-gray-50"
                                : "border-r border-[var(--app-line)] bg-white hover:bg-gray-50"
                          }
                          style={{
                            gridColumn: dayIndex + 2,
                            gridRow: `1 / ${laneCount + 1}`,
                          }}
                          aria-label={`${row.companyName} ${dateKey} 채용 일정`}
                        />
                      );
                    })}

                    {row.segments.map((segment) => (
                      <Link
                        key={`${row.companyId}-${segment.range.job.id}-${segment.startColumn}-${segment.endColumn}`}
                        href={jobDetailHref(segment.range.job.id)}
                        className={`z-10 mx-1 flex h-8 min-w-0 items-center gap-2 self-center overflow-hidden border px-2 text-xs font-bold shadow-sm transition-shadow hover:shadow-md ${rangeSegmentClassName(segment)}`}
                        style={{
                          gridColumn: `${segment.startColumn + 2} / ${
                            segment.endColumn + 3
                          }`,
                          gridRow: segment.lane + 1,
                        }}
                      >
                        <span className="rounded-md bg-white/75 px-1.5 py-0.5 text-[11px] text-[var(--brand)]">
                          {weeklySegmentBadge(segment)}
                        </span>
                        <span className="truncate">
                          {segment.range.job.title}
                        </span>
                        <Bookmark
                          size={14}
                          className="ml-auto shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="grid min-h-52 place-items-center border-b border-[var(--app-line)] bg-gray-50 px-6 text-center text-sm text-gray-500">
                이 기간에 표시할 채용 일정이 없습니다.
              </div>
            )}
          </div>
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

function buildScrollableCompanyRows(dates: Date[], ranges: JobCalendarRange[]) {
  const rangeStartDate = dates[0];
  const rangeEndDate = dates[dates.length - 1];
  const grouped = new Map<
    string,
    {
      companyId: string;
      companyName: string;
      companyLogoUrl: string | null;
      ranges: JobCalendarRange[];
    }
  >();

  for (const range of ranges) {
    if (!rangeIntersectsDates(range, rangeStartDate, rangeEndDate)) continue;
    const { companyId, companyName, companyLogoUrl } = range.job;
    const group =
      grouped.get(companyId) ??
      {
        companyId,
        companyName,
        companyLogoUrl,
        ranges: [],
      };
    group.ranges.push(range);
    grouped.set(companyId, group);
  }

  return [...grouped.values()]
    .map<ScrollableCompanyRow>((group) => {
      const laneEndColumns: number[] = [];
      const segments = group.ranges
        .sort(compareCalendarRanges)
        .map<CalendarRangeSegment>((range) => {
          const rangeStart = fromDateKey(range.startDate);
          const rangeEnd = fromDateKey(range.endDate ?? range.startDate);
          const segmentStart =
            rangeStart.getTime() > rangeStartDate.getTime()
              ? rangeStart
              : rangeStartDate;
          const segmentEnd =
            rangeEnd.getTime() < rangeEndDate.getTime()
              ? rangeEnd
              : rangeEndDate;
          const startColumn = daysBetween(rangeStartDate, segmentStart);
          const endColumn = daysBetween(rangeStartDate, segmentEnd);
          const openLane = laneEndColumns.findIndex(
            (laneEnd) => laneEnd < startColumn,
          );
          const lane = openLane === -1 ? laneEndColumns.length : openLane;
          laneEndColumns[lane] = endColumn;

          return {
            range,
            lane,
            startColumn,
            endColumn,
            startsAtRangeStart: toDateKey(segmentStart) === range.startDate,
            endsAtRangeEnd:
              toDateKey(segmentEnd) === (range.endDate ?? range.startDate),
          };
        });

      return {
        companyId: group.companyId,
        companyName: group.companyName,
        companyLogoUrl: group.companyLogoUrl,
        segments,
        laneCount: Math.max(laneEndColumns.length, 1),
      };
    })
    .sort((first, second) => {
      const firstStart = Math.min(
        ...first.segments.map((segment) => segment.startColumn),
      );
      const secondStart = Math.min(
        ...second.segments.map((segment) => segment.startColumn),
      );
      if (firstStart !== secondStart) return firstStart - secondStart;
      return first.companyName.localeCompare(second.companyName);
    });
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

function dateFromRangeSegmentClick(
  event: MouseEvent<HTMLDivElement>,
  week: Date[],
  segment: CalendarRangeSegment,
) {
  const rect = event.currentTarget.getBoundingClientRect();
  const columns = segment.endColumn - segment.startColumn + 1;
  const rawColumn = Math.floor(
    ((event.clientX - rect.left) / Math.max(rect.width, 1)) * columns,
  );
  const column = Math.min(Math.max(rawColumn, 0), columns - 1);
  return toDateKey(week[segment.startColumn + column]);
}

function rangeSegmentClassName(segment: CalendarRangeSegment) {
  const rangeHasDeadline = segment.range.endDate !== null;
  const colorClassName = rangeHasDeadline
    ? "border-[var(--brand-mid)] bg-[var(--brand-soft)] text-[var(--brand)]"
    : "border-gray-200 bg-gray-50 text-gray-700";

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

function weeklySegmentBadge(segment: CalendarRangeSegment) {
  if (segment.endsAtRangeEnd && segment.range.endDate) return "마감";
  if (segment.startsAtRangeStart) return "시작";
  return "진행";
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
      <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
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
            className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
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
            <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-400">
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
    <article className={`group grid cursor-pointer gap-3 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${meta.barClassName}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{meta.label}</Badge>
        {event.type !== "DEADLINE" && <Badge>{deadlineText(event.job)}</Badge>}
        <span className="text-xs font-medium text-[var(--app-muted)]">
          {event.job.companyName}
        </span>
      </div>
      <div className="grid gap-1">
        <Link
          href={jobDetailHref(event.job.id)}
          className="font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--brand)]"
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

function CompanyLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <span
        className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 bg-white bg-contain bg-center bg-no-repeat shadow-sm"
        style={{ backgroundImage: `url("${logoUrl}")` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-sm font-black text-gray-400">
      {name.trim().charAt(0) || "기"}
    </span>
  );
}

function formatTimelineHeaderDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

function formatModalDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
