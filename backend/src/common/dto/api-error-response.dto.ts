import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDetailDto {
  @ApiProperty({
    description: 'Field path that failed validation or processing.',
    example: 'triggeredBy',
  })
  field: string;

  @ApiProperty({
    description: 'Detailed reason for the error detail.',
    example: 'triggeredBy must be longer than or equal to 2 characters',
  })
  message: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Stable machine-readable error code.',
    example: 'VALIDATION_ERROR',
  })
  errorCode: string;

  @ApiProperty({
    description: 'Human-readable error summary.',
    example: 'Request validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP request path that produced this error.',
    example: '/repos/42/refresh',
  })
  path: string;

  @ApiProperty({
    description: 'RFC3339 timestamp when the error happened.',
    example: '2026-04-15T08:00:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({
    type: [ApiErrorDetailDto],
    description: 'Optional structured detail list.',
  })
  details?: ApiErrorDetailDto[];
}
