"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompanyForm } from "@/components/admin/company-form";
import styles from "@/components/admin/admin.module.css";

export function AdminCompanyEditClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className={styles.messageError}>
        회사 ID가 누락되었습니다.{" "}
        <Link href="/admin/companies" className={styles.brandLink}>
          회사 목록으로 이동
        </Link>
      </div>
    );
  }

  return <CompanyForm companyId={id} />;
}
