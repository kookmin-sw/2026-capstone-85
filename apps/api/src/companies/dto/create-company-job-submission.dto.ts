import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DeadlineType,
  EmploymentType,
  JobFamily,
  KicpaCondition,
  TraineeStatus,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCompanyJobSubmissionDto {
  @ApiProperty({ example: '수습 CPA 감사본부 채용' })
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ example: '회계감사 보조와 재무제표 검토 업무를 수행합니다.' })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 'https://example.com/careers/audit-trainee' })
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  originalUrl!: string;

  @ApiProperty({ enum: JobFamily })
  @IsEnum(JobFamily)
  jobFamily!: JobFamily;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiProperty({ enum: KicpaCondition })
  @IsEnum(KicpaCondition)
  kicpaCondition!: KicpaCondition;

  @ApiProperty({ enum: TraineeStatus })
  @IsEnum(TraineeStatus)
  traineeStatus!: TraineeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  practicalTrainingInstitution?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  minExperienceYears?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  maxExperienceYears?: number;

  @ApiPropertyOptional({ example: '서울 중구' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiProperty({ enum: DeadlineType })
  @IsEnum(DeadlineType)
  deadlineType!: DeadlineType;

  @ApiPropertyOptional({ example: '2026-05-31T14:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
