import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateJobFilterPreferenceDto {
  @ApiProperty({
    example: {
      search: '감사',
      selectedLocations: ['서울 중구', '서울 강남구'],
      sort: 'deadlineAsc',
    },
  })
  @IsObject()
  filter!: Record<string, unknown>;
}
