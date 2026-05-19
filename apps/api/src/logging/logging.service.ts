import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogSource = 'FE' | 'BE';

type RecordLogInput = {
  key: string;
  level?: string | null;
  source?: string | null;
  userId?: string | null;
  incognitoUserId?: string | null;
  path?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  properties?: Record<string, unknown> | null;
};

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'jwt',
  'password',
  'passwordhash',
  'secret',
  'token',
  'access_token',
  'refresh_token',
]);

@Injectable()
export class LoggingService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordLogInput) {
    try {
      await this.prisma.appLog.create({
        data: {
          key: input.key,
          level: normalizeLevel(input.level),
          source: normalizeSource(input.source),
          userId: input.userId || null,
          incognitoUserId: input.incognitoUserId || null,
          path: input.path || null,
          userAgent: input.userAgent || null,
          ipAddress: input.ipAddress || null,
          properties: normalizeJson(
            input.properties ?? {},
          ) as Prisma.InputJsonValue,
        },
      });
    } catch {
      // Logging must never break the user-facing request path.
    }
  }

  async error(key: string, properties?: Record<string, unknown>) {
    await this.record({
      key,
      level: 'error',
      source: 'BE',
      properties,
    });
  }
}

function normalizeLevel(level: RecordLogInput['level']): LogLevel {
  if (
    level === 'debug' ||
    level === 'info' ||
    level === 'warn' ||
    level === 'error'
  ) {
    return level;
  }
  return 'info';
}

function normalizeSource(source: RecordLogInput['source']): LogSource {
  return source === 'BE' ? 'BE' : 'FE';
}

function normalizeJson(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (
    typeof value === 'bigint' ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    return '[unserializable]';
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return '[unserializable]';
    seen.add(value);
    if (Array.isArray(value)) {
      return value.map((item) => normalizeJson(item, seen));
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase())
          ? '[REDACTED]'
          : normalizeJson(entry, seen),
      ]),
    );
  }
  return '[unserializable]';
}
