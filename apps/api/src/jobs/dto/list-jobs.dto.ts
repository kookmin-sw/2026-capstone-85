import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CompanyType,
  JobFamily,
  KicpaCondition,
  TraineeStatus,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

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

  @ApiPropertyOptional({ enum: TraineeStatus })
  @IsOptional()
  @IsEnum(TraineeStatus)
  traineeStatus?: TraineeStatus;

  @ApiPropertyOptional({ enum: KicpaCondition })
  @IsOptional()
  @IsEnum(KicpaCondition)
  kicpaCondition?: KicpaCondition;

  @ApiPropertyOptional({
    enum: ['deadlineAsc', 'latest'],
    default: 'deadlineAsc',
  })
  @IsOptional()
  @IsIn(['deadlineAsc', 'latest'])
  sort?: 'deadlineAsc' | 'latest';

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
