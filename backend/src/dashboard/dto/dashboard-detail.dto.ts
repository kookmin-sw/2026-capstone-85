import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriorityLevel, WorkItemState, WorkItemType } from './dashboard-item.dto';

export class WorkItemAuthorDto {
  @ApiProperty({ example: 'alice' })
  login: string;

  @ApiProperty({ example: 'Alice Kim' })
  displayName: string;
}

export class LabelSuggestionDto {
  @ApiProperty({ example: 'bug' })
  label: string;

  @ApiProperty({
    example: 0.93,
    description: 'Suggested confidence score from classifier.',
  })
  confidence: number;

  @ApiProperty({
    example: 'Crash keyword and stack trace detected in body.',
  })
  reason: string;
}

export class DuplicateContextDto {
  @ApiProperty({ example: true })
  isDuplicate: boolean;

  @ApiPropertyOptional({
    example: 'dup-group-22',
    description: 'Duplicate group identifier if duplicate was detected.',
  })
  duplicateGroupId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['repo-101-issue-120', 'repo-101-pr-88'],
  })
  relatedItemIds?: string[];
}

export class ConversationDto {
  @ApiProperty({ example: 'cmt_1001' })
  id: string;

  @ApiProperty({ type: WorkItemAuthorDto })
  author: WorkItemAuthorDto;

  @ApiProperty({
    example: 'Thanks, I can reproduce this on the latest main branch.',
  })
  body: string;

  @ApiProperty({ example: true })
  canEdit: boolean;

  @ApiProperty({ example: '2026-04-15T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-15T08:03:00.000Z' })
  updatedAt: string;
}

export class DashboardItemDetailResponseDto {
  @ApiProperty({ example: 'repo-101-pr-88' })
  id: string;

  @ApiProperty({ example: 101 })
  repositoryId: number;

  @ApiProperty({ example: 'swiftlang/swift' })
  repositoryFullName: string;

  @ApiProperty({ enum: WorkItemType, example: WorkItemType.PULL_REQUEST })
  taskType: WorkItemType;

  @ApiProperty({ enum: WorkItemState, example: WorkItemState.OPEN })
  state: WorkItemState;

  @ApiProperty({ enum: PriorityLevel, example: PriorityLevel.HIGH })
  priority: PriorityLevel;

  @ApiProperty({ example: true })
  isReviewer: boolean;

  @ApiProperty({
    example: 'Fix critical cache invalidation bug',
  })
  title: string;

  @ApiProperty({
    example:
      'Detailed body content. Includes reproduction steps, expected behavior, and current behavior.',
  })
  body: string;

  @ApiProperty({
    type: [String],
    example: ['bug', 'priority/high'],
  })
  labels: string[];

  @ApiProperty({ type: [LabelSuggestionDto] })
  suggestedLabels: LabelSuggestionDto[];

  @ApiProperty({ type: WorkItemAuthorDto })
  author: WorkItemAuthorDto;

  @ApiProperty({ type: DuplicateContextDto })
  duplicateContext: DuplicateContextDto;

  @ApiProperty({ type: [ConversationDto] })
  conversations: ConversationDto[];

  @ApiProperty({
    example: 'https://github.com/swiftlang/swift/pull/88428',
  })
  externalUrl: string;

  @ApiProperty({ example: '2026-04-14T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-15T08:00:00.000Z' })
  updatedAt: string;
}

export class DiffFileDto {
  @ApiProperty({ example: 'Sources/Cache/Store.swift' })
  path: string;

  @ApiProperty({ example: 28 })
  additions: number;

  @ApiProperty({ example: 4 })
  deletions: number;

  @ApiProperty({
    example: '@@ -10,6 +10,18 @@ final class Store { ... }',
    description: 'Unified diff excerpt.',
  })
  patch: string;
}

export class DashboardItemDiffResponseDto {
  @ApiProperty({ example: 'repo-101-pr-88' })
  itemId: string;

  @ApiProperty({ example: 2 })
  changedFiles: number;

  @ApiProperty({ example: 31 })
  totalAdditions: number;

  @ApiProperty({ example: 7 })
  totalDeletions: number;

  @ApiProperty({ type: [DiffFileDto] })
  files: DiffFileDto[];
}
