"use client";

import { COMPANY_TYPES } from "@cpa/shared";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  createAdminCompany,
  fetchAdminCompany,
  updateAdminCompany,
  type AdminCompanyPayload,
  type AdminCompanyType,
  companyTypeLabels,
} from "@/components/admin/admin-demo-data";
import { adminInputClass } from "@/components/admin/admin-ui";

type CompanyFormState = {
  name: string;
  type: AdminCompanyType;
  websiteUrl: string;
  logoUrl: string;
  description: string;
  businessNumber: string;
  externalLinks: string;
  tags: string;
  employeeCount: string;
  averageSalary: string;
  foundedYear: string;
  recentAttritionRate: string;
};

const blankForm: CompanyFormState = {
  name: "",
  type: "LOCAL_ACCOUNTING_FIRM",
  websiteUrl: "",
  logoUrl: "",
  description: "",
  businessNumber: "",
  externalLinks: "",
  tags: "",
  employeeCount: "",
  averageSalary: "",
  foundedYear: "",
  recentAttritionRate: "",
};

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalNumber(value: string) {
  if (!value.trim()) return null;
  return Number(value);
}

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CompanyForm({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<CompanyFormState>(blankForm);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!companyId) return;
    let ignore = false;
    fetchAdminCompany(companyId)
      .then((company) => {
        if (ignore) return;
        setForm({
          name: company.name,
          type: company.type,
          websiteUrl: company.websiteUrl ?? "",
          logoUrl: company.logoUrl ?? "",
          description: company.description ?? "",
          businessNumber: company.businessNumber ?? "",
          externalLinks: company.externalLinks.join("\n"),
          tags: company.tags.join(", "),
          employeeCount:
            company.employeeCount === null ? "" : String(company.employeeCount),
          averageSalary:
            company.averageSalary === null ? "" : String(company.averageSalary),
          foundedYear:
            company.foundedYear === null ? "" : String(company.foundedYear),
          recentAttritionRate:
            company.recentAttritionRate === null
              ? ""
              : String(company.recentAttritionRate),
        });
      })
      .catch((caught: Error) => {
        if (!ignore) setMessage(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [companyId]);

  function update<K extends keyof CompanyFormState>(
    key: K,
    value: CompanyFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload: AdminCompanyPayload = {
      name: form.name.trim(),
      type: form.type,
      websiteUrl: nullable(form.websiteUrl),
      logoUrl: nullable(form.logoUrl),
      description: nullable(form.description),
      businessNumber: nullable(form.businessNumber),
      externalLinks: splitList(form.externalLinks),
      tags: splitList(form.tags),
      employeeCount: optionalNumber(form.employeeCount),
      averageSalary: optionalNumber(form.averageSalary),
      foundedYear: optionalNumber(form.foundedYear),
      recentAttritionRate: optionalNumber(form.recentAttritionRate),
    };

    setSaving(true);
    try {
      if (companyId) {
        await updateAdminCompany(companyId, payload);
      } else {
        await createAdminCompany(payload);
      }
      router.push("/admin/companies");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">회사 정보를 불러오는 중입니다.</div>;
  }

  return (
    <form className="grid gap-6" onSubmit={submit}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {companyId ? "회사 수정" : "회사 생성"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            회사 삭제와 숨김 처리는 이번 프로토타입 범위에서 제외합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--proto-brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--proto-brand-dark)] disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "저장 중" : "저장"}
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <section className="grid gap-5 rounded-lg border border-[var(--app-line)] bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="회사명">
            <input
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className={adminInputClass}
            />
          </Field>
          <Field label="회사 유형">
            <select
              value={form.type}
              onChange={(event) =>
                update("type", event.target.value as AdminCompanyType)
              }
              className={adminInputClass}
            >
              {COMPANY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {companyTypeLabels[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="홈페이지 URL">
            <input
              value={form.websiteUrl}
              onChange={(event) => update("websiteUrl", event.target.value)}
              className={adminInputClass}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="로고 URL">
            <input
              value={form.logoUrl}
              onChange={(event) => update("logoUrl", event.target.value)}
              className={adminInputClass}
              placeholder="/company-logos/example.png"
            />
          </Field>
          <Field label="사업자번호">
            <input
              value={form.businessNumber}
              onChange={(event) => update("businessNumber", event.target.value)}
              className={adminInputClass}
            />
          </Field>
          <Field label="태그">
            <input
              value={form.tags}
              onChange={(event) => update("tags", event.target.value)}
              className={adminInputClass}
              placeholder="감사, 수습, Big4"
            />
          </Field>
        </div>

        <Field label="회사 설명">
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className={`${adminInputClass} min-h-36`}
          />
        </Field>

        <Field label="외부 링크">
          <textarea
            value={form.externalLinks}
            onChange={(event) => update("externalLinks", event.target.value)}
            className={`${adminInputClass} min-h-24`}
            placeholder="한 줄에 하나씩 입력"
          />
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--app-line)] bg-white p-5 lg:grid-cols-4">
        <Field label="직원 수">
          <input
            type="number"
            min={0}
            value={form.employeeCount}
            onChange={(event) => update("employeeCount", event.target.value)}
            className={adminInputClass}
          />
        </Field>
        <Field label="평균연봉(만원)">
          <input
            type="number"
            min={0}
            value={form.averageSalary}
            onChange={(event) => update("averageSalary", event.target.value)}
            className={adminInputClass}
          />
        </Field>
        <Field label="설립연도">
          <input
            type="number"
            min={1800}
            max={2100}
            value={form.foundedYear}
            onChange={(event) => update("foundedYear", event.target.value)}
            className={adminInputClass}
          />
        </Field>
        <Field label="최근 퇴사율(%)">
          <input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={form.recentAttritionRate}
            onChange={(event) =>
              update("recentAttritionRate", event.target.value)
            }
            className={adminInputClass}
          />
        </Field>
      </section>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700">
      {label}
      {children}
    </label>
  );
}
