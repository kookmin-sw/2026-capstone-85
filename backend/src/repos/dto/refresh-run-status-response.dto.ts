import { ApiProperty } from '@nestjs/swagger';

export enum RefreshRunLifecycleStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class RefreshRunStatusResponseDto {
  @ApiProperty({ example: 101 })
  repoId: number;

  @ApiProperty({ example: 'run_8dbf6d86-5422-420f-a509-beb8f45aa718' })
  runId: string;

  @ApiProperty({
    enum: RefreshRunLifecycleStatus,
    example: RefreshRunLifecycleStatus.RUNNING,
  })
  status: RefreshRunLifecycleStatus;

  @ApiProperty({ example: 'manual_console_refresh' })
  triggeredBy: string;

  @ApiProperty({ example: '2026-04-15T08:00:00.000Z' })
  requestedAt: string;

  @ApiProperty({ example: '2026-04-15T08:02:00.000Z', required: false })
  finishedAt?: string;

  @ApiProperty({
    example: 120,
    description: 'Number of issue/PR entities processed in this run.',
  })
  processedItems: number;
}
