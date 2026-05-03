const dayMs = 86_400_000;

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfWeek(date: Date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function getCalendarGridRange(monthDate: Date) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  return {
    from: startOfWeek(monthStart),
    to: endOfWeek(monthEnd),
  };
}

export function getCalendarGridDays(monthDate: Date) {
  const { from, to } = getCalendarGridRange(monthDate);
  const days: Date[] = [];
  for (
    let cursor = new Date(from);
    cursor.getTime() <= to.getTime();
    cursor = addDays(cursor, 1)
  ) {
    days.push(new Date(cursor));
  }
  return days;
}

export function isSameDay(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

export function isInRange(date: Date, from: Date, to: Date) {
  const value = fromDateKey(toDateKey(date)).getTime();
  return value >= fromDateKey(toDateKey(from)).getTime() && value <= to.getTime();
}

export function daysBetween(from: Date, to: Date) {
  return Math.round(
    (fromDateKey(toDateKey(to)).getTime() -
      fromDateKey(toDateKey(from)).getTime()) /
      dayMs,
  );
}
