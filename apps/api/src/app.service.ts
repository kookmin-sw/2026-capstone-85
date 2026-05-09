import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'cpa-job-platform-api',
      docs: process.env.ENABLE_SWAGGER === 'true' ? '/docs' : null,
    };
  }
}
