import { LoggingController } from './logging.controller';
import { LoggingService } from './logging.service';

describe('LoggingController', () => {
  it('records FE logs with authenticated or incognito identity context', async () => {
    const record = jest.fn<
      Promise<void>,
      [Parameters<LoggingService['record']>[0]]
    >();
    record.mockResolvedValue(undefined);
    const loggingService = {
      record,
    } as unknown as LoggingService;
    const controller = new LoggingController(loggingService);

    await controller.create(
      {
        key: 'move_to_company_page',
        incognitoUserId: 'anon-1',
        path: '/companies/company-1',
        properties: { company: '두나무' },
      },
      {
        user: {
          id: 'user-1',
          username: 'tester',
          role: 'JOB_SEEKER',
          companyId: null,
        },
        headers: { 'user-agent': 'test-agent' },
        ip: '127.0.0.1',
      } as never,
    );

    expect(record).toHaveBeenCalledWith({
      key: 'move_to_company_page',
      level: undefined,
      source: 'FE',
      userId: 'user-1',
      incognitoUserId: 'anon-1',
      path: '/companies/company-1',
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
      properties: { company: '두나무' },
    });
  });
});
