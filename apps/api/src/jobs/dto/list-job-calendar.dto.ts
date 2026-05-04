import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { ListJobsDto } from './list-jobs.dto';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export class ListJobCalendarDto extends ListJobsDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsString()
  @Matches(datePattern)
  from!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsString()
  @Matches(datePattern)
  to!: string;
}
