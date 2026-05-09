import { Suspense } from "react";
import styles from "@/components/admin/admin.module.css";
import { AdminCompanyEditClient } from "./edit-client";

function EditFallback() {
  return <div className={styles.loadingText}>회사 정보를 불러오는 중입니다.</div>;
}

export default function EditAdminCompanyPage() {
  return (
    <Suspense fallback={<EditFallback />}>
      <AdminCompanyEditClient />
    </Suspense>
  );
}
