import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CompanyType,
  DeadlineType,
  EmploymentType,
  JobFamily,
  KicpaCondition,
  TraineeStatus,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toOptionalBoolean = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const toOptionalStringArray = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

export class ListJobsDto {
  @ApiPropertyOptional({ example: '감사' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: JobFamily })
  @IsOptional()
  @IsEnum(JobFamily)
  jobFamily?: JobFamily;

  @ApiPropertyOptional({ enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @ApiPropertyOptional({ example: '서울' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ type: [String], example: ['서울', '대구 서구'] })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalStringArray(value))
  @IsString({ each: true })
  locations?: string[];

  @ApiPropertyOptional({ enum: TraineeStatus })
  @IsOptional()
  @IsEnum(TraineeStatus)
  traineeStatus?: TraineeStatus;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: KicpaCondition })
  @IsOptional()
  @IsEnum(KicpaCondition)
  kicpaCondition?: KicpaCondition;

  @ApiPropertyOptional({ enum: DeadlineType })
  @IsOptional()
  @IsEnum(DeadlineType)
  deadlineType?: DeadlineType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalBoolean(value))
  @IsBoolean()
  practicalTrainingInstitution?: boolean;

  @ApiPropertyOptional({ default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  deadlineWithinDays?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  minExperienceYears?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  maxExperienceYears?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minCompanyAgeYears?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  maxCompanyAgeYears?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  maxAttritionRate?: number;

  @ApiPropertyOptional({
    enum: ['deadlineAsc', 'latest', 'experienceAsc', 'companyType'],
    default: 'deadlineAsc',
  })
  @IsOptional()
  @IsIn(['deadlineAsc', 'latest', 'experienceAsc', 'companyType'])
  sort?: 'deadlineAsc' | 'latest' | 'experienceAsc' | 'companyType';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
