import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RefreshRepoRequestDto {
  @ApiProperty({
    description: 'Who or what requested this refresh.',
    example: 'manual_console_refresh',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  triggeredBy: string;

  @ApiPropertyOptional({
    description: 'If true, bypasses lightweight change checks.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}
