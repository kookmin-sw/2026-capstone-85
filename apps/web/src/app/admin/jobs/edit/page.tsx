import { Suspense } from "react";
import styles from "@/components/admin/admin.module.css";
import { AdminJobEditClient } from "./edit-client";

function EditFallback() {
  return <div className={styles.loadingText}>공고 정보를 불러오는 중입니다.</div>;
}

export default function EditAdminJobPage() {
  return (
    <Suspense fallback={<EditFallback />}>
      <AdminJobEditClient />
    </Suspense>
  );
}
