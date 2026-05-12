import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
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
    private readonly redisHealth: RedisHealthService,
    private readonly config: ConfigService
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
    if (!this.config.get<string>('DATABASE_URL')) {
      throw new ServiceUnavailableException('DATABASE_URL is not configured.');
    }

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

  @Get('storage')
  async getStorageHealth(): Promise<HealthResponse> {
    const defaultStoragePath = process.env.VERCEL ? '/tmp/vc-platform-storage' : join(process.cwd(), 'storage');
    const storagePath = this.config.get<string>('STORAGE_PATH', defaultStoragePath);
    await mkdir(storagePath, { recursive: true });
    await access(storagePath);
    const probe = join(storagePath, `.health-${Date.now()}.txt`);
    await writeFile(probe, 'ok');
    await unlink(probe);
    return {
      status: 'ok',
      service: 'storage',
      timestamp: new Date().toISOString(),
      details: { storagePath }
    };
  }

  @Get('ai')
  getAiHealth(): HealthResponse {
    const configured = Boolean(this.config.get<string>('ALIBABA_API_KEY'));
    return {
      status: configured ? 'ok' : 'error',
      service: 'alibaba-qwen',
      timestamp: new Date().toISOString(),
      details: {
        configured,
        model: this.config.get<string>('ALIBABA_MODEL', 'qwen-plus'),
        baseUrl: this.config.get<string>('ALIBABA_API_BASE_URL', 'https://dashscope-intl.aliyuncs.com')
      }
    };
  }
}

