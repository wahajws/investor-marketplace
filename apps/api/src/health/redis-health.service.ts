import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthService {
  constructor(private readonly config: ConfigService) {}

  async ping() {
    const client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(this.config.get<string>('REDIS_PORT', '6379')),
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });

    try {
      await client.connect();
      const response = await client.ping();
      return { response };
    } finally {
      client.disconnect();
    }
  }
}
