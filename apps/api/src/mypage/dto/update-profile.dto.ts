import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '수습 CPA 김철수', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'c9d1ad4f-96f1-4c1b-86bb-5af4c59f64a8',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  profileImageAssetId?: string;
}
