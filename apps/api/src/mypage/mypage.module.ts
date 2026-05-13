import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobFitAnalysisAiService } from './job-fit-analysis-ai.service';
import { MypageController } from './mypage.controller';
import { MypageService } from './mypage.service';

@Module({
  imports: [AssetsModule, AuthModule, NotificationsModule],
  controllers: [MypageController],
  providers: [JobFitAnalysisAiService, MypageService],
})
export class MypageModule {}
