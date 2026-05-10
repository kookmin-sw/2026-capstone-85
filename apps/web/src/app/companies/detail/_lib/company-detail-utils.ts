export function formatCompanyAge(foundedYear: number | null): string {
  if (!foundedYear) return "미공개";
  const years = new Date().getFullYear() - foundedYear + 1;
  return `${years.toLocaleString("ko-KR")}년차`;
}

export function formatSalary(salary: number | null): string {
  if (!salary) return "미공개";
  return `${salary.toLocaleString("ko-KR")}만원`;
}

export function formatRate(rate: number | null): string {
  if (rate === null) return "미공개";
  return `${rate.toLocaleString("ko-KR")}%`;
}
