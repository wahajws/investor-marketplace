import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthService } from './redis-health.service';

type HealthResponse = {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisHealth: RedisHealthService
  ) {}

  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'vc-intelligence-api',
      timestamp: new Date().toISOString()
    };
  }

  @Get('db')
  async getDatabaseHealth(): Promise<HealthResponse> {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'mysql',
      timestamp: new Date().toISOString()
    };
  }

  @Get('redis')
  async getRedisHealth(): Promise<HealthResponse> {
    const details = await this.redisHealth.ping();

    return {
      status: 'ok',
      service: 'redis',
      timestamp: new Date().toISOString(),
      details
    };
  }
}

