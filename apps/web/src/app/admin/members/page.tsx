"use client";

import { USER_ROLES } from "@cpa/shared";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminMembers,
  type AdminMember,
  userRoleLabels,
} from "@/components/admin/admin-demo-data";
import { adminInputClass } from "@/components/admin/admin-ui";
import { RoleBadge } from "@/components/admin/status-badge";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const next = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (search.trim()) next.set("search", search.trim());
    if (role) next.set("role", role);
    return next;
  }, [page, role, search]);

  useEffect(() => {
    let ignore = false;
    fetchAdminMembers(params)
      .then((data) => {
        if (!ignore) {
          setMembers(data.items);
          setTotal(data.total);
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
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-bold">회원 리스트</h2>
        <p className="mt-1 text-sm text-gray-500">
          민감 정보와 프로필 상세는 표시하지 않고, 조회 전용으로만 제공합니다.
        </p>
      </div>

      <section className="rounded-lg border border-[var(--app-line)] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={`${adminInputClass} pl-9`}
              placeholder="아이디 또는 표시 이름 검색"
            />
          </div>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className={adminInputClass}
          >
            <option value="">전체 유형</option>
            {USER_ROLES.map((option) => (
              <option key={option} value={option}>
                {userRoleLabels[option]}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end text-sm text-gray-500">
            총 {total.toLocaleString("ko-KR")}명
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-[var(--app-line)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--app-line)] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">표시 이름</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    회원을 불러오는 중입니다.
                  </td>
                </tr>
              ) : members.length ? (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {member.id}
                    </td>
                    <td className="px-4 py-3 font-semibold">{member.username}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {member.displayName ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-700">
                      활성
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(member.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    조건에 맞는 회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-sm text-gray-500">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  );
}
