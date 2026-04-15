import { ApiProperty } from '@nestjs/swagger';

export enum RepoProvider {
  GITHUB = 'GITHUB',
}

export class RepoDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ enum: RepoProvider, example: RepoProvider.GITHUB })
  provider: RepoProvider;

  @ApiProperty({ example: 'swiftlang/swift' })
  fullName: string;

  @ApiProperty({ example: true })
  autoLabelingEnabled: boolean;

  @ApiProperty({ example: '2026-04-15T08:00:00.000Z', required: false })
  lastSyncedAt?: string;
}

export class RepoListResponseDto {
  @ApiProperty({ type: [RepoDto] })
  items: RepoDto[];

  @ApiProperty({ example: 1 })
  total: number;
}
