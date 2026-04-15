import { ApiProperty } from '@nestjs/swagger';
import { DashboardItemDto } from './dashboard-item.dto';

export class DashboardItemsResponseDto {
  @ApiProperty({ type: [DashboardItemDto] })
  items: DashboardItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 2 })
  total: number;
}
