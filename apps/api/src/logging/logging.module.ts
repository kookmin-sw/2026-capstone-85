import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoggingController } from './logging.controller';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [LoggingController],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
