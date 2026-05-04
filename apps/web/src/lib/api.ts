import type {
  CompanyDetailItem,
  CompanyListItem,
  JobCalendarResponse,
  JobDetailItem,
  JobFilterPreference,
  JobFilterPreferenceResponse,
  JobListItem,
} from "@cpa/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type JobListResponse = {
  items: JobListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type CompanyListResponse = {
  items: CompanyListItem[];
  total: number;
  openTotal: number;
  noJobTotal: number;
};

export type AuthUser = {
  id: string;
  username: string;
  displayName: string | null;
  role: "JOB_SEEKER" | "COMPANY" | "ADMIN";
  companyId: string | null;
};

export async function fetchJobs(params: URLSearchParams) {
  const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("공고 목록을 불러오지 못했습니다.");
  }
  return (await response.json()) as JobListResponse;
}

export async function fetchJobDetail(id: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("공고 상세를 불러오지 못했습니다.");
  }
  return (await response.json()) as JobDetailItem;
}

export async function fetchJobCalendar(params: URLSearchParams) {
  const response = await fetch(
    `${API_BASE_URL}/jobs/calendar?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error("마감 캘린더를 불러오지 못했습니다.");
  }
  return (await response.json()) as JobCalendarResponse;
}

export async function fetchCompanies(params: URLSearchParams) {
  const response = await fetch(
    `${API_BASE_URL}/companies?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error("회사 목록을 불러오지 못했습니다.");
  }
  return (await response.json()) as CompanyListResponse;
}

export async function fetchCompanyDetail(id: string) {
  const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("회사 상세를 불러오지 못했습니다.");
  }
  return (await response.json()) as CompanyDetailItem;
}

export async function authRequest(
  mode: "login" | "register",
  payload: Record<string, string>,
) {
  const response = await fetch(`${API_BASE_URL}/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { user?: AuthUser; message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "인증 요청에 실패했습니다.");
  }
  return data.user;
}

export async function fetchJobFilterPreference() {
  const response = await fetch(`${API_BASE_URL}/users/me/job-filter`, {
    cache: "no-store",
    credentials: "include",
  });
  if (response.status === 401) {
    throw new Error("로그인이 필요합니다.");
  }
  if (!response.ok) {
    throw new Error("저장된 필터를 불러오지 못했습니다.");
  }
  const data = (await response.json()) as JobFilterPreferenceResponse;
  return data;
}

export async function saveJobFilterPreference(filter: JobFilterPreference) {
  const response = await fetch(`${API_BASE_URL}/users/me/job-filter`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ filter }),
  });
  if (response.status === 401) {
    throw new Error("로그인이 필요합니다.");
  }
  if (!response.ok) {
    throw new Error("필터를 저장하지 못했습니다.");
  }
  return (await response.json()) as JobFilterPreferenceResponse;
}

export async function fetchAdminHealth() {
  const response = await fetch(`${API_BASE_URL}/admin/health`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return (await response.json()) as { ok: boolean; area: string };
}
