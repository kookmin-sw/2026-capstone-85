"use client";

import { jobPresetConfigs } from "@cpa/shared";
import type { JobFilterState } from "@/lib/job-filters";
import { cn } from "@/lib/utils";
import styles from "./job-preset-bar.module.css";

type JobPresetBarProps = {
  filters: JobFilterState;
  onChange: (filters: JobFilterState) => void;
  className?: string;
};

export function JobPresetBar({
  filters,
  onChange,
  className,
}: JobPresetBarProps) {
  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.row}>
        <span className={styles.groupLabel}>기본</span>
        {jobPresetConfigs.map((preset) => {
          const selected = filters.preset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  preset: selected ? "" : preset.id,
                })
              }
              className={cn(styles.chip, selected && styles.chipSelected)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
