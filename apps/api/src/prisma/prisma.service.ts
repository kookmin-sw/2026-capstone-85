import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const envDatabaseUrl = process.env.DATABASE_URL?.trim();
    if (!envDatabaseUrl && process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL must be set in production.');
    }

    const connectionString =
      envDatabaseUrl ??
      'postgresql://cpa:cpa@localhost:5432/cpa_jobs?schema=public';
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
