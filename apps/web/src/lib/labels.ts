export const jobFamilyLabels: Record<string, string> = {
  AUDIT: "감사",
  TAX: "세무",
  FAS: "FAS",
  DEAL: "Deal",
  INTERNAL_ACCOUNTING: "내부회계",
  IN_HOUSE: "인하우스",
};

export const companyTypeLabels: Record<string, string> = {
  BIG4: "Big4",
  LOCAL_ACCOUNTING_FIRM: "로컬 회계법인",
  MID_SMALL_ACCOUNTING_FIRM: "중소 회계법인",
  FINANCIAL_COMPANY: "금융사",
  GENERAL_COMPANY: "일반 기업",
  PUBLIC_INSTITUTION: "공공기관",
};

export const kicpaLabels: Record<string, string> = {
  REQUIRED: "KICPA 필수",
  PREFERRED: "KICPA 우대",
  NONE: "무관",
  UNCLEAR: "불명확",
};

export const traineeLabels: Record<string, string> = {
  AVAILABLE: "수습 가능",
  UNAVAILABLE: "수습 불가",
  UNCLEAR: "수습 불명확",
};

export const employmentLabels: Record<string, string> = {
  FULL_TIME: "정규직",
  CONTRACT: "계약직",
  INTERN: "인턴",
  PART_TIME: "파트타임",
};

export const deadlineTypeLabels: Record<string, string> = {
  FIXED_DATE: "마감일 지정",
  UNTIL_FILLED: "채용 시 마감",
  ALWAYS_OPEN: "상시채용",
};
