import type { JobListItem } from "@cpa/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type JobListResponse = {
  items: JobListItem[];
  page: number;
  pageSize: number;
  total: number;
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

export async function fetchAdminHealth() {
  const response = await fetch(`${API_BASE_URL}/admin/health`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return (await response.json()) as { ok: boolean; area: string };
}
