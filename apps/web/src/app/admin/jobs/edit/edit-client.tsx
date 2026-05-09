"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { JobForm } from "@/components/admin/job-form";
import styles from "@/components/admin/admin.module.css";

export function AdminJobEditClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className={styles.messageError}>
        공고 ID가 누락되었습니다.{" "}
        <Link href="/admin/jobs" className={styles.brandLink}>
          공고 목록으로 이동
        </Link>
      </div>
    );
  }

  return <JobForm jobId={id} />;
}
