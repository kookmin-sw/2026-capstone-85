import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateConversationRequestDto {
  @ApiProperty({
    example: 'Can confirm this bug on macOS 15.4 as well.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body: string;
}

export class UpdateConversationRequestDto {
  @ApiProperty({
    example: 'Updated with reproduction video and logs.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body: string;
}

export class ApplyRecommendedLabelsRequestDto {
  @ApiProperty({
    type: [String],
    example: ['bug', 'priority/high'],
    description:
      'Selected labels from recommendation results to apply to the target item.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  labels: string[];
}

export class ResolveDuplicateRequestDto {
  @ApiProperty({
    example: 'repo-101-issue-120',
    description: 'Item to keep open as canonical issue/PR.',
  })
  @IsString()
  @MinLength(3)
  keepItemId: string;

  @ApiProperty({
    type: [String],
    example: ['repo-101-pr-88', 'repo-101-issue-133'],
    description: 'Items to close as duplicates.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  closeItemIds: string[];

  @ApiPropertyOptional({
    example:
      'Closing duplicated threads to keep canonical context in repo-101-issue-120.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
