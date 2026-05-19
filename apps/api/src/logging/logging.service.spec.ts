import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from './logging.service';

type AppLogCreateArgs = {
  data: {
    key: string;
    level: string;
    source: string;
    userId: string | null;
    incognitoUserId: string | null;
    path: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    properties: unknown;
  };
};

describe('LoggingService', () => {
  let prisma: {
    appLog: {
      create: jest.Mock<Promise<{ id: string }>, [AppLogCreateArgs]>;
    };
  };
  let service: LoggingService;

  beforeEach(() => {
    prisma = {
      appLog: {
        create: jest.fn<Promise<{ id: string }>, [AppLogCreateArgs]>(),
      },
    };
    prisma.appLog.create.mockResolvedValue({ id: 'log-1' });
    service = new LoggingService(prisma as unknown as PrismaService);
  });

  it('stores structured logs with user identity and redacted sensitive fields', async () => {
    const error = new Error('request failed');
    const circularArray: unknown[] = [];
    circularArray.push(circularArray);

    await service.record({
      key: 'move_to_company_page',
      level: 'warn',
      source: 'FE',
      userId: 'user-1',
      incognitoUserId: 'anon-1',
      path: '/companies?name=%EB%91%90%EB%82%98%EB%AC%B4',
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
      properties: {
        company: '두나무',
        token: 'plain-token',
        nested: {
          password: 'plain-password',
          visible: 'safe',
        },
        list: [{ authorization: 'Bearer secret' }],
        bigint: BigInt(1),
        circularArray,
        error,
      },
    });

    expect(prisma.appLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.appLog.create.mock.calls[0][0]).toEqual({
      data: {
        key: 'move_to_company_page',
        level: 'warn',
        source: 'FE',
        userId: 'user-1',
        incognitoUserId: 'anon-1',
        path: '/companies?name=%EB%91%90%EB%82%98%EB%AC%B4',
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
        properties: {
          company: '두나무',
          token: '[REDACTED]',
          nested: {
            password: '[REDACTED]',
            visible: 'safe',
          },
          list: [{ authorization: '[REDACTED]' }],
          bigint: '[unserializable]',
          circularArray: ['[unserializable]'],
          error: {
            name: 'Error',
            message: 'request failed',
            stack: error.stack,
          },
        },
      },
    });
  });

  it('does not throw when log persistence fails', async () => {
    prisma.appLog.create.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(
      service.record({
        key: 'companies_query_error',
        level: 'error',
        source: 'BE',
        properties: { error: 'database unavailable' },
      }),
    ).resolves.toBeUndefined();
  });
});
