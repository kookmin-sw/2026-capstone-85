import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCompanyProfileSubmissionDto {
  @ApiPropertyOptional({ example: '한빛회계법인' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  websiteUrl?: string;

  @ApiPropertyOptional({ example: '감사와 세무에 특화된 회계법인입니다.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '123-45-67890' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  businessNumber?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ require_tld: false }, { each: true })
  @MaxLength(500, { each: true })
  externalLinks?: string[];

  @ApiPropertyOptional({ type: [String], example: ['수습가능', '감사'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];
}
