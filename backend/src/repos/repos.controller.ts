import { randomUUID } from 'crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActionResultDto } from '../common/dto/action-result.dto';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { CreateRepoRequestDto } from './dto/create-repo-request.dto';
import { RefreshRepoRequestDto } from './dto/refresh-repo-request.dto';
import {
  RefreshRepoResponseDto,
  RefreshRunStatus,
} from './dto/refresh-repo-response.dto';
import {
  RefreshRunLifecycleStatus,
  RefreshRunStatusResponseDto,
} from './dto/refresh-run-status-response.dto';
import { RepoDto, RepoListResponseDto, RepoProvider } from './dto/repo.dto';

@ApiTags('Repositories')
@ApiBearerAuth('bearer')
@Controller('repos')
export class ReposController {
  @Get()
  @ApiOperation({
    summary: 'List repositories',
    description: 'Returns repositories managed in TidyX workspace.',
  })
  @ApiOkResponse({
    description: 'Repository list.',
    type: RepoListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: ApiErrorResponseDto,
  })
  listRepositories(): RepoListResponseDto {
    const items: RepoDto[] = [
      {
        id: 101,
        provider: RepoProvider.GITHUB,
        fullName: 'swiftlang/swift',
        autoLabelingEnabled: true,
        lastSyncedAt: '2026-04-15T08:00:00.000Z',
      },
    ];

    return {
      items,
      total: items.length,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Add repository',
    description:
      'Registers a repository for dashboard ingestion and issue/PR management.',
  })
  @ApiCreatedResponse({
    description: 'Repository added.',
    type: RepoDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid repository full name.',
    type: ApiErrorResponseDto,
  })
  createRepository(@Body() request: CreateRepoRequestDto): RepoDto {
    return {
      id: 999,
      provider: RepoProvider.GITHUB,
      fullName: request.fullName,
      autoLabelingEnabled: true,
      lastSyncedAt: undefined,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete repository',
    description: 'Removes repository from managed list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 101,
  })
  @ApiNoContentResponse({
    description: 'Repository deleted.',
  })
  deleteRepository(@Param('id', ParseIntPipe) id: number): void {
    void id;
  }

  @Post(':id/refresh')
  @ApiOperation({
    summary: 'Trigger repository refresh',
    description:
      'Creates a refresh run to ingest latest issue/PR state from provider.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Local repository identifier.',
    example: 101,
  })
  @ApiOkResponse({
    description: 'Refresh run accepted.',
    type: RefreshRepoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid path parameter or body payload.',
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
  refreshRepository(
    @Param('id', ParseIntPipe) repoId: number,
    @Body() request: RefreshRepoRequestDto,
  ): RefreshRepoResponseDto {
    void request;

    return {
      repoId,
      runId: `run_${randomUUID()}`,
      status: RefreshRunStatus.QUEUED,
      requestedAt: new Date().toISOString(),
    };
  }

  @Get(':id/refresh/:runId')
  @ApiOperation({
    summary: 'Get refresh run status',
    description: 'Returns current lifecycle status for a refresh run.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 101,
  })
  @ApiParam({
    name: 'runId',
    example: 'run_8dbf6d86-5422-420f-a509-beb8f45aa718',
  })
  @ApiOkResponse({
    description: 'Refresh run status.',
    type: RefreshRunStatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameter format.',
    type: ApiErrorResponseDto,
  })
  getRefreshRunStatus(
    @Param('id', ParseIntPipe) repoId: number,
    @Param('runId') runId: string,
  ): RefreshRunStatusResponseDto {
    return {
      repoId,
      runId,
      status: RefreshRunLifecycleStatus.RUNNING,
      triggeredBy: 'manual_console_refresh',
      requestedAt: '2026-04-15T08:00:00.000Z',
      processedItems: 120,
    };
  }

  @Post(':id/switch')
  @ApiOperation({
    summary: 'Switch active repository',
    description: 'Sets active repository for current console context.',
  })
  @ApiOkResponse({
    description: 'Active repository switched.',
    type: ActionResultDto,
  })
  switchRepository(@Param('id', ParseIntPipe) id: number): ActionResultDto {
    return {
      success: true,
      message: `Active repository switched to ${id}.`,
    };
  }
}
