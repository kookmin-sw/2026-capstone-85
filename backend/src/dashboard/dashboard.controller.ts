import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActionResultDto } from '../common/dto/action-result.dto';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import {
  ApplyRecommendedLabelsRequestDto,
  CreateConversationRequestDto,
  ResolveDuplicateRequestDto,
  UpdateConversationRequestDto,
} from './dto/dashboard-action-requests.dto';
import {
  DashboardItemDetailResponseDto,
  DashboardItemDiffResponseDto,
} from './dto/dashboard-detail.dto';
import {
  DashboardItemDto,
  PriorityLevel,
  WorkItemState,
  WorkItemType,
} from './dto/dashboard-item.dto';
import {
  DashboardItemsQueryDto,
  DashboardSortBy,
  SortOrder,
} from './dto/dashboard-query.dto';
import { DashboardItemsResponseDto } from './dto/dashboard-items-response.dto';

const PRIORITY_SCORE: Record<PriorityLevel, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('dashboard')
export class DashboardController {
  @Get('items')
  @ApiOperation({
    summary: 'List dashboard work items',
    description:
      'Returns merged Issue/PR items with sorting and filtering for personalized triage.',
  })
  @ApiOkResponse({
    description: 'Dashboard item list.',
    type: DashboardItemsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query input.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: ApiErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
    type: ApiErrorResponseDto,
  })
  getItems(@Query() query: DashboardItemsQueryDto): DashboardItemsResponseDto {
    const summaryLength = query.summaryLength ?? 140;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? DashboardSortBy.PRIORITY;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const allItems: DashboardItemDto[] = [
      {
        id: 'repo-101-pr-88',
        taskType: WorkItemType.PULL_REQUEST,
        title: 'Fix critical cache invalidation bug',
        summary:
          'Fixes stale reads when multiple refresh workers process same repository updates concurrently.',
        priority: PriorityLevel.HIGH,
        state: WorkItemState.OPEN,
        isReviewer: true,
        isDuplicate: true,
        duplicateGroupId: 'dup-group-22',
        updatedAt: '2026-04-15T08:00:00.000Z',
      },
      {
        id: 'repo-101-issue-240',
        taskType: WorkItemType.ISSUE,
        title: 'Update typo in onboarding docs',
        summary: 'Simple docs typo fix request in quick start section.',
        priority: PriorityLevel.LOW,
        state: WorkItemState.OPEN,
        isReviewer: false,
        isDuplicate: false,
        updatedAt: '2026-04-15T07:55:00.000Z',
      },
      {
        id: 'repo-101-issue-120',
        taskType: WorkItemType.ISSUE,
        title: 'Crash during large file import',
        summary:
          'Reports crash and possible data corruption during import in standard library parsing tool.',
        priority: PriorityLevel.HIGH,
        state: WorkItemState.OPEN,
        isReviewer: false,
        isDuplicate: true,
        duplicateGroupId: 'dup-group-22',
        updatedAt: '2026-04-15T08:01:00.000Z',
      },
    ];

    const filtered = allItems
      .filter((item) => {
        if (query.priorities && query.priorities.length > 0) {
          return query.priorities.includes(item.priority);
        }
        return true;
      })
      .filter((item) => {
        if (query.taskTypes && query.taskTypes.length > 0) {
          return query.taskTypes.includes(item.taskType);
        }
        return true;
      })
      .filter((item) =>
        typeof query.isReviewer === 'boolean'
          ? item.isReviewer === query.isReviewer
          : true,
      )
      .filter((item) => {
        if (!query.label) {
          return true;
        }
        // Placeholder filter semantics for spec completeness.
        return item.id.includes('101');
      })
      .sort((left, right) => {
        if (sortBy === DashboardSortBy.PRIORITY) {
          const diff =
            PRIORITY_SCORE[left.priority] - PRIORITY_SCORE[right.priority];
          return sortOrder === SortOrder.ASC ? diff : -diff;
        }
        const leftTime = new Date(left.updatedAt).getTime();
        const rightTime = new Date(right.updatedAt).getTime();
        const diff = leftTime - rightTime;
        return sortOrder === SortOrder.ASC ? diff : -diff;
      })
      .map((item) => ({
        ...item,
        summary:
          item.summary.length <= summaryLength
            ? item.summary
            : `${item.summary.slice(0, summaryLength)}...`,
      }));

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return {
      items,
      page,
      limit,
      total: filtered.length,
    };
  }

  @Get('items/:itemId')
  @ApiOperation({
    summary: 'Get dashboard item detail',
    description:
      'Returns full content, conversations, duplicate context, and label recommendations.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiOkResponse({
    description: 'Detailed issue/PR information.',
    type: DashboardItemDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid item ID format.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: ApiErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
    type: ApiErrorResponseDto,
  })
  getItemDetail(@Param('itemId') itemId: string): DashboardItemDetailResponseDto {
    return {
      id: itemId,
      repositoryId: 101,
      repositoryFullName: 'swiftlang/swift',
      taskType: itemId.includes('-pr-')
        ? WorkItemType.PULL_REQUEST
        : WorkItemType.ISSUE,
      state: WorkItemState.OPEN,
      priority: PriorityLevel.HIGH,
      isReviewer: true,
      title: 'Fix critical cache invalidation bug',
      body: 'Detailed body content for dashboard detail view. Includes logs and reproduction steps.',
      labels: ['bug', 'priority/high'],
      suggestedLabels: [
        {
          label: 'bug',
          confidence: 0.93,
          reason: 'Crash keyword and stack trace detected in body.',
        },
        {
          label: 'priority/high',
          confidence: 0.86,
          reason: 'Reviewer assignment and critical failure signal.',
        },
      ],
      author: {
        login: 'alice',
        displayName: 'Alice Kim',
      },
      duplicateContext: {
        isDuplicate: true,
        duplicateGroupId: 'dup-group-22',
        relatedItemIds: ['repo-101-issue-120', 'repo-101-pr-88'],
      },
      conversations: [
        {
          id: 'cmt_1001',
          author: {
            login: 'bob',
            displayName: 'Bob Choi',
          },
          body: 'Can reproduce this issue in current main branch.',
          canEdit: false,
          createdAt: '2026-04-15T08:00:00.000Z',
          updatedAt: '2026-04-15T08:00:00.000Z',
        },
      ],
      externalUrl: 'https://github.com/swiftlang/swift/pull/88428',
      createdAt: '2026-04-14T10:00:00.000Z',
      updatedAt: '2026-04-15T08:00:00.000Z',
    };
  }

  @Get('items/:itemId/diff')
  @ApiOperation({
    summary: 'Get code diff preview',
    description:
      'Returns code diff summary used in dashboard detail for pull requests.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiOkResponse({
    description: 'Diff summary response.',
    type: DashboardItemDiffResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid item ID.',
    type: ApiErrorResponseDto,
  })
  getItemDiff(@Param('itemId') itemId: string): DashboardItemDiffResponseDto {
    return {
      itemId,
      changedFiles: 2,
      totalAdditions: 31,
      totalDeletions: 7,
      files: [
        {
          path: 'Sources/Cache/Store.swift',
          additions: 28,
          deletions: 4,
          patch: '@@ -10,6 +10,18 @@ final class Store { ... }',
        },
        {
          path: 'Tests/Cache/StoreTests.swift',
          additions: 3,
          deletions: 3,
          patch: '@@ -44,3 +44,3 @@ func testConcurrentRefresh() { ... }',
        },
      ],
    };
  }

  @Post('items/:itemId/conversations')
  @ApiOperation({
    summary: 'Create conversation message',
    description: 'Adds a new conversation/comment to issue or pull request.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiOkResponse({
    description: 'Conversation created.',
    type: ActionResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
    type: ApiErrorResponseDto,
  })
  createConversation(
    @Param('itemId') itemId: string,
    @Body() request: CreateConversationRequestDto,
  ): ActionResultDto {
    void request;
    return {
      success: true,
      message: `Conversation created for ${itemId}.`,
      affectedItemIds: [itemId],
    };
  }

  @Patch('items/:itemId/conversations/:conversationId')
  @ApiOperation({
    summary: 'Update conversation message',
    description: 'Updates existing conversation/comment text.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiParam({
    name: 'conversationId',
    example: 'cmt_1001',
  })
  @ApiOkResponse({
    description: 'Conversation updated.',
    type: ActionResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
    type: ApiErrorResponseDto,
  })
  updateConversation(
    @Param('itemId') itemId: string,
    @Param('conversationId') conversationId: string,
    @Body() request: UpdateConversationRequestDto,
  ): ActionResultDto {
    void request;
    return {
      success: true,
      message: `Conversation ${conversationId} updated for ${itemId}.`,
      affectedItemIds: [itemId],
    };
  }

  @Post('items/:itemId/labels/recommendations/apply')
  @ApiOperation({
    summary: 'Apply recommended labels',
    description: 'Applies selected labels from recommendation list.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiOkResponse({
    description: 'Labels applied.',
    type: ActionResultDto,
  })
  applyRecommendedLabels(
    @Param('itemId') itemId: string,
    @Body() request: ApplyRecommendedLabelsRequestDto,
  ): ActionResultDto {
    return {
      success: true,
      message: `Applied ${request.labels.length} labels to ${itemId}.`,
      affectedItemIds: [itemId],
    };
  }

  @Post('items/:itemId/duplicates/resolve')
  @ApiOperation({
    summary: 'Resolve duplicate group',
    description:
      'Keeps one canonical item and closes selected duplicated issue/PR entries.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-pr-88',
  })
  @ApiOkResponse({
    description: 'Duplicate resolution completed.',
    type: ActionResultDto,
  })
  resolveDuplicateGroup(
    @Param('itemId') itemId: string,
    @Body() request: ResolveDuplicateRequestDto,
  ): ActionResultDto {
    return {
      success: true,
      message: `Kept ${request.keepItemId} and closed ${request.closeItemIds.length} duplicates.`,
      affectedItemIds: [itemId, ...request.closeItemIds],
    };
  }

  @Post('items/:itemId/close')
  @ApiOperation({
    summary: 'Close issue or pull request',
    description: 'Closes the target work item directly from dashboard detail.',
  })
  @ApiParam({
    name: 'itemId',
    example: 'repo-101-issue-240',
  })
  @ApiOkResponse({
    description: 'Item closed.',
    type: ActionResultDto,
  })
  closeItem(@Param('itemId') itemId: string): ActionResultDto {
    return {
      success: true,
      message: `${itemId} has been closed.`,
      affectedItemIds: [itemId],
    };
  }
}
