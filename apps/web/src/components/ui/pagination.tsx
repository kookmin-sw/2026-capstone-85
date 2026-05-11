import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./pagination.module.css";

const PAGE_GROUP_SIZE = 5;

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const group = Math.ceil(page / PAGE_GROUP_SIZE);
  const groupStart = (group - 1) * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(group * PAGE_GROUP_SIZE, totalPages);
  const hasPrevGroup = group > 1;
  const hasNextGroup = groupEnd < totalPages;

  const pages: number[] = [];
  for (let i = groupStart; i <= groupEnd; i++) pages.push(i);

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        onClick={() => onPageChange(groupStart - PAGE_GROUP_SIZE)}
        disabled={!hasPrevGroup}
        className={styles.arrow}
        aria-label="이전 페이지 그룹"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={p === page ? styles.pageBtnActive : styles.pageBtn}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(groupEnd + 1)}
        disabled={!hasNextGroup}
        className={styles.arrow}
        aria-label="다음 페이지 그룹"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
