import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test002' })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password!: string;

  @ApiPropertyOptional({ example: 'd2fb2d38-cf62-4e50-a6f1-bd7ac7dc5d77' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  incognitoUserId?: string;
}
