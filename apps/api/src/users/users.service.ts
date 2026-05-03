import { Injectable } from '@nestjs/common';
import type { JobFilterPreference } from '@cpa/shared';
import { PrismaService } from '../prisma/prisma.service';

const stringFilterKeys = [
  'search',
  'jobFamily',
  'companyType',
  'traineeStatus',
  'employmentType',
  'kicpaCondition',
  'deadlineType',
  'practicalTrainingInstitution',
  'deadlineWithinDays',
  'minExperienceYears',
  'maxExperienceYears',
  'minCompanyAgeYears',
  'maxCompanyAgeYears',
  'maxAttritionRate',
  'sort',
] as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getJobFilterPreference(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { jobFilterPreference: true },
    });

    return {
      filter: this.normalizeJobFilterPreference(user?.jobFilterPreference),
      authenticated: true,
    };
  }

  async updateJobFilterPreference(
    userId: string,
    filter: Record<string, unknown>,
  ) {
    const normalized = this.normalizeJobFilterPreference(filter) ?? {};
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        jobFilterPreference: normalized,
      },
    });

    return { filter: normalized, authenticated: true };
  }

  private normalizeJobFilterPreference(
    value: unknown,
  ): JobFilterPreference | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const input = value as Record<string, unknown>;
    const filter: JobFilterPreference = {};
    for (const key of stringFilterKeys) {
      const raw = input[key];
      if (typeof raw === 'string') {
        filter[key] = raw.slice(0, 120);
      }
    }

    if (Array.isArray(input.selectedLocations)) {
      filter.selectedLocations = input.selectedLocations
        .filter((location): location is string => typeof location === 'string')
        .map((location) => location.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 30);
    }

    return filter;
  }
}
