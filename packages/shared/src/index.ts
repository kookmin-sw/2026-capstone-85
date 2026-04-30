export const USER_ROLES = ["JOB_SEEKER", "COMPANY", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_FAMILIES = [
  "AUDIT",
  "TAX",
  "FAS",
  "DEAL",
  "INTERNAL_ACCOUNTING",
  "IN_HOUSE",
] as const;
export type JobFamily = (typeof JOB_FAMILIES)[number];

export const COMPANY_TYPES = [
  "BIG4",
  "LOCAL_ACCOUNTING_FIRM",
  "MID_SMALL_ACCOUNTING_FIRM",
  "FINANCIAL_COMPANY",
  "GENERAL_COMPANY",
  "PUBLIC_INSTITUTION",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "CONTRACT",
  "INTERN",
  "PART_TIME",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const KICPA_CONDITIONS = ["REQUIRED", "PREFERRED", "NONE", "UNCLEAR"] as const;
export type KicpaCondition = (typeof KICPA_CONDITIONS)[number];

export const TRAINEE_STATUSES = ["AVAILABLE", "UNAVAILABLE", "UNCLEAR"] as const;
export type TraineeStatus = (typeof TRAINEE_STATUSES)[number];

export const DEADLINE_TYPES = ["FIXED_DATE", "UNTIL_FILLED", "ALWAYS_OPEN"] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const JOB_STATUSES = ["OPEN", "CLOSED", "DRAFT"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export type JobListItem = {
  id: string;
  title: string;
  companyName: string;
  companyType: CompanyType;
  jobFamily: JobFamily;
  employmentType: EmploymentType;
  kicpaCondition: KicpaCondition;
  traineeStatus: TraineeStatus;
  deadlineType: DeadlineType;
  deadline: string | null;
  dDay: number | null;
  sourceName: string;
  originalUrl: string;
  lastCheckedAt: string;
  labels: string[];
};
