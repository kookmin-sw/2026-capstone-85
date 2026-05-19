import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { CreateLogDto } from './dto/create-log.dto';
import { LoggingService } from './logging.service';

@Controller('log')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Post()
  @HttpCode(204)
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() dto: CreateLogDto,
    @Req() req: RequestWithUser & Request,
  ) {
    await this.loggingService.record({
      key: dto.key,
      level: dto.level,
      source: dto.source ?? 'FE',
      userId: req.user?.id ?? null,
      incognitoUserId: dto.incognitoUserId ?? null,
      path: dto.path ?? null,
      userAgent: headerToString(req.headers['user-agent']),
      ipAddress: req.ip,
      properties: dto.properties ?? {},
    });
  }
}

function headerToString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(', ');
  return value ?? null;
}
