import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PriorityLevel, WorkItemType } from './dashboard-item.dto';

export enum DashboardSortBy {
  PRIORITY = 'PRIORITY',
  UPDATED_AT = 'UPDATED_AT',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

function parseCsvArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
  }
  return undefined;
}

export class DashboardItemsQueryDto {
  @ApiPropertyOptional({ enum: DashboardSortBy, example: DashboardSortBy.PRIORITY })
  @IsOptional()
  @IsEnum(DashboardSortBy)
  sortBy?: DashboardSortBy = DashboardSortBy.PRIORITY;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    enum: PriorityLevel,
    isArray: true,
    example: [PriorityLevel.HIGH, PriorityLevel.MEDIUM],
    description: 'CSV or repeated query values are supported.',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsvArray(value))
  @IsEnum(PriorityLevel, { each: true })
  priorities?: PriorityLevel[];

  @ApiPropertyOptional({
    enum: WorkItemType,
    isArray: true,
    example: [WorkItemType.PULL_REQUEST],
    description: 'CSV or repeated query values are supported.',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsvArray(value))
  @IsEnum(WorkItemType, { each: true })
  taskTypes?: WorkItemType[];

  @ApiPropertyOptional({
    example: true,
    description: 'Filter to items where current user is reviewer.',
  })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isReviewer?: boolean;

  @ApiPropertyOptional({
    example: 3,
    description: 'Dashboard filter derived from selected project.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;

  @ApiPropertyOptional({
    example: 'bug',
    description: 'Filter by label name.',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    example: 140,
    description: 'Summary preview max length.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(500)
  summaryLength?: number = 140;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
