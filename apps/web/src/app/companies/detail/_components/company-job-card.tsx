import type { JobListItem } from "@cpa/shared";
import Link from "next/link";
import { actionButtonClassName } from "@/components/ui/action-button";
import { deadlineTypeLabels, jobFamilyLabels, traineeLabels } from "@/lib/labels";
import { jobDetailHref } from "@/lib/routes";
import styles from "./company-job-card.module.css";

export function CompanyJobCard({ job }: { job: JobListItem }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.tags}>
          <span className={styles.tagBrand}>{jobFamilyLabels[job.jobFamily]}</span>
          <span className={styles.tagNeutral}>{traineeLabels[job.traineeStatus]}</span>
        </div>
        <h3 className={styles.title}>{job.title}</h3>
        <p className={styles.deadline}>
          {job.deadline
            ? new Date(job.deadline).toLocaleDateString("ko-KR")
            : deadlineTypeLabels[job.deadlineType]}
        </p>
      </div>
      <Link href={jobDetailHref(job.id)} className={actionButtonClassName({ size: "sm" })}>
        공고 보기
      </Link>
    </article>
  );
}
