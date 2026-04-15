import { ApiProperty } from '@nestjs/swagger';

export enum WorkItemType {
  ISSUE = 'ISSUE',
  PULL_REQUEST = 'PULL_REQUEST',
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum WorkItemState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class DashboardItemDto {
  @ApiProperty({ example: 'repo-101-pr-88' })
  id: string;

  @ApiProperty({ enum: WorkItemType, example: WorkItemType.PULL_REQUEST })
  taskType: WorkItemType;

  @ApiProperty({ example: 'Fix critical cache invalidation bug' })
  title: string;

  @ApiProperty({
    description: 'Brief summary shown in dashboard list.',
    example: 'Fixes stale read when two workers refresh in parallel.',
  })
  summary: string;

  @ApiProperty({ enum: PriorityLevel, example: PriorityLevel.HIGH })
  priority: PriorityLevel;

  @ApiProperty({ enum: WorkItemState, example: WorkItemState.OPEN })
  state: WorkItemState;

  @ApiProperty({
    description: 'Whether current user is reviewer for this item.',
    example: true,
  })
  isReviewer: boolean;

  @ApiProperty({
    description: 'Whether this item is part of a duplicate group.',
    example: true,
  })
  isDuplicate: boolean;

  @ApiProperty({
    description: 'Duplicate group identifier when duplicate is detected.',
    example: 'dup-group-22',
    required: false,
  })
  duplicateGroupId?: string;

  @ApiProperty({ example: '2026-04-15T07:58:00.000Z' })
  updatedAt: string;
}
