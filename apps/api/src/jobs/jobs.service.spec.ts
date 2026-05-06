import { NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

describe('JobsService public detail visibility', () => {
  let prisma: {
    job: {
      findFirst: jest.Mock;
    };
  };
  let service: JobsService;

  beforeEach(() => {
    prisma = {
      job: {
        findFirst: jest.fn(),
      },
    };
    service = new JobsService(prisma as unknown as PrismaService);
  });

  it('does not return closed jobs from public detail lookups', async () => {
    prisma.job.findFirst.mockResolvedValue(null);

    await expect(service.detail('job-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.job.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1', status: JobStatus.OPEN },
      }),
    );
  });
});
