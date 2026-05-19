import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLogDto {
  @IsString()
  @MaxLength(120)
  key!: string;

  @IsOptional()
  @IsIn(['debug', 'info', 'warn', 'error'])
  level?: string;

  @IsOptional()
  @IsIn(['FE', 'BE'])
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  incognitoUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  path?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}
