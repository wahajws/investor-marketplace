import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { RedisHealthService } from './redis-health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  it('returns API health', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn() }
        },
        {
          provide: RedisHealthService,
          useValue: { ping: jest.fn() }
        }
      ]
    }).compile();

    const controller = moduleRef.get(HealthController);
    expect(controller.getHealth().status).toBe('ok');
  });
});

