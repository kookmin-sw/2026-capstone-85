import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActionResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'Action completed successfully.',
    description: 'Human-readable action result message.',
  })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional set of affected work item IDs.',
    example: ['repo-101-pr-88', 'repo-101-pr-90'],
  })
  affectedItemIds?: string[];
}
