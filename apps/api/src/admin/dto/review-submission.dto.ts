import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewSubmissionDto {
  @ApiPropertyOptional({ example: '원문 링크 확인 후 승인했습니다.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
