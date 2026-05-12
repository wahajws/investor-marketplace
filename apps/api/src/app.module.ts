import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DomainModule } from './domain/domain.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), 'apps/api/.env'),
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../apps/api/.env'),
        resolve(process.cwd(), '../../.env')
      ]
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    DomainModule
  ]
})
export class AppModule {}
