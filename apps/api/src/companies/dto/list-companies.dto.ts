import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType } from '@prisma/client';
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

export class ListCompaniesDto {
  @ApiPropertyOptional({ example: '세무' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @ApiPropertyOptional({ example: 'ESG' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalBoolean(value))
  @IsBoolean()
  hasOpenJobs?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minEmployeeCount?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxEmployeeCount?: number;

  @ApiPropertyOptional({ example: 6000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAverageSalary?: number;

  @ApiPropertyOptional({ example: 9000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAverageSalary?: number;

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
    enum: ['name', 'employeeCountDesc', 'averageSalaryDesc', 'companyAgeDesc'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'employeeCountDesc', 'averageSalaryDesc', 'companyAgeDesc'])
  sort?: 'name' | 'employeeCountDesc' | 'averageSalaryDesc' | 'companyAgeDesc';
}
