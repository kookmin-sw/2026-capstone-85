import type {
  JobCalendarDay,
  JobCalendarEvent,
  JobListItem,
} from "@cpa/shared";
import { fromDateKey, toDateKey } from "./date-utils";

export function calendarDaysToMap(days: JobCalendarDay[]) {
  return days.reduce<Record<string, JobCalendarDay>>((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {});
}

export function calendarEventsToMap(events: JobCalendarEvent[]) {
  return events.reduce<Record<string, JobCalendarEvent[]>>((acc, event) => {
    const eventsForDate = acc[event.date] ?? [];
    eventsForDate.push(event);
    acc[event.date] = eventsForDate;
    return acc;
  }, {});
}

export function jobsBetween(
  days: JobCalendarDay[],
  from: Date,
  to: Date,
): JobListItem[] {
  const fromTime = fromDateKey(toDateKey(from)).getTime();
  const toTime = fromDateKey(toDateKey(to)).getTime();
  return days
    .filter((day) => {
      const value = fromDateKey(day.date).getTime();
      return value >= fromTime && value <= toTime;
    })
    .flatMap((day) => day.jobs)
    .sort((a, b) => {
      const first = a.deadline ? new Date(a.deadline).getTime() : 0;
      const second = b.deadline ? new Date(b.deadline).getTime() : 0;
      return first - second;
    });
}
