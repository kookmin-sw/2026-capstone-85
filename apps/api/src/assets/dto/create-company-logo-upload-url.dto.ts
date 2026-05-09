import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, MaxLength, Min, Max } from 'class-validator';
import {
  COMPANY_LOGO_ALLOWED_CONTENT_TYPES,
  COMPANY_LOGO_MAX_BYTES,
} from '../logo-asset.constants';

export class CreateCompanyLogoUploadUrlDto {
  @ApiProperty({ example: 'logo.png' })
  @IsString()
  @MaxLength(180)
  fileName!: string;

  @ApiProperty({
    enum: COMPANY_LOGO_ALLOWED_CONTENT_TYPES,
    example: 'image/png',
  })
  @IsString()
  @IsIn(COMPANY_LOGO_ALLOWED_CONTENT_TYPES)
  contentType!: string;

  @ApiProperty({ example: 234567, maximum: COMPANY_LOGO_MAX_BYTES })
  @IsInt()
  @Min(1)
  @Max(COMPANY_LOGO_MAX_BYTES)
  byteSize!: number;
}
