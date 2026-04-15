import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { HealthController } from './health/health.controller';
import { ReposController } from './repos/repos.controller';

@Module({
  imports: [],
  controllers: [
    HealthController,
    DashboardController,
    ReposController,
  ],
  providers: [],
})
export class AppModule {}
