import { ApiProperty } from '@nestjs/swagger';

export enum RefreshRunStatus {
  QUEUED = 'QUEUED',
}

export class RefreshRepoResponseDto {
  @ApiProperty({ example: 101 })
  repoId: number;

  @ApiProperty({
    description: 'Sync run identifier for tracking status.',
    example: 'run_8dbf6d86-5422-420f-a509-beb8f45aa718',
  })
  runId: string;

  @ApiProperty({ enum: RefreshRunStatus, example: RefreshRunStatus.QUEUED })
  status: RefreshRunStatus;

  @ApiProperty({ example: '2026-04-15T08:00:00.000Z' })
  requestedAt: string;
}
