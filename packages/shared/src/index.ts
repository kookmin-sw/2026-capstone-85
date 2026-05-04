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

export const KICPA_CONDITIONS = [
  "REQUIRED",
  "PREFERRED",
  "NONE",
  "UNCLEAR",
] as const;
export type KicpaCondition = (typeof KICPA_CONDITIONS)[number];

export const TRAINEE_STATUSES = [
  "AVAILABLE",
  "UNAVAILABLE",
  "UNCLEAR",
] as const;
export type TraineeStatus = (typeof TRAINEE_STATUSES)[number];

export const DEADLINE_TYPES = [
  "FIXED_DATE",
  "UNTIL_FILLED",
  "ALWAYS_OPEN",
] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const JOB_STATUSES = ["OPEN", "CLOSED", "DRAFT"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const AI_SUGGESTION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type AiSuggestionStatus = (typeof AI_SUGGESTION_STATUSES)[number];

export type JobListItem = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyType: CompanyType;
  jobFamily: JobFamily;
  employmentType: EmploymentType;
  kicpaCondition: KicpaCondition;
  traineeStatus: TraineeStatus;
  practicalTrainingInstitution: boolean | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  location: string | null;
  deadlineType: DeadlineType;
  deadline: string | null;
  dDay: number | null;
  sourceName: string;
  originalUrl: string;
  createdAt: string;
  lastCheckedAt: string;
  labels: string[];
};

export type JobAiSuggestion = {
  id: string;
  summary: string;
  tags: string[];
  risks: string[];
  status: AiSuggestionStatus;
  createdAt: string;
  updatedAt: string;
};

export type JobDetailItem = JobListItem & {
  description: string;
  aiSuggestion: JobAiSuggestion | null;
};

export type JobCalendarItem = JobListItem;

export type JobCalendarEventType = "START" | "DEADLINE";

export type JobCalendarEvent = {
  date: string;
  type: JobCalendarEventType;
  job: JobCalendarItem;
};

export type JobCalendarRange = {
  startDate: string;
  endDate: string | null;
  job: JobCalendarItem;
};

export type JobCalendarDay = {
  date: string;
  total: number;
  jobs: JobCalendarItem[];
};

export type JobCalendarResponse = {
  from: string;
  to: string;
  days: JobCalendarDay[];
  events: JobCalendarEvent[];
  ranges: JobCalendarRange[];
};

export type JobFilterPreference = {
  search?: string;
  jobFamily?: string;
  companyType?: string;
  traineeStatus?: string;
  selectedLocations?: string[];
  employmentType?: string;
  kicpaCondition?: string;
  deadlineType?: string;
  practicalTrainingInstitution?: string;
  deadlineWithinDays?: string;
  minExperienceYears?: string;
  maxExperienceYears?: string;
  minCompanyAgeYears?: string;
  maxCompanyAgeYears?: string;
  maxAttritionRate?: string;
  sort?: string;
};

export type JobFilterPreferenceResponse = {
  filter: JobFilterPreference | null;
  authenticated: boolean;
};

export type EmployeeTrendPoint = {
  month: string;
  joined: number;
  left: number;
  total: number;
};

export type CompanyListItem = {
  id: string;
  name: string;
  type: CompanyType;
  websiteUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  tags: string[];
  employeeCount: number | null;
  averageSalary: number | null;
  foundedYear: number | null;
  recentAttritionRate: number | null;
  openJobCount: number;
};

export type CompanyDetailItem = CompanyListItem & {
  businessNumber: string | null;
  externalLinks: string[];
  employeeTrend: EmployeeTrendPoint[];
  openJobs: JobListItem[];
};
