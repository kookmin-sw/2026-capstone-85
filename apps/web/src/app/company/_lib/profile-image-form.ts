import type { CompanyDashboardResponse } from "@cpa/shared";

export type ProfileImageForm = {
  logoAssetId: string;
  logoUrl: string;
};

export const emptyProfileImageForm: ProfileImageForm = {
  logoAssetId: "",
  logoUrl: "",
};

export function toProfileImageForm(
  dashboard: CompanyDashboardResponse,
): ProfileImageForm {
  return {
    logoAssetId: "",
    logoUrl: dashboard.company.logoUrl ?? "",
  };
}
