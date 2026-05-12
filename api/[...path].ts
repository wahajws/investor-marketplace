import 'reflect-metadata';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { configureApp } from '../apps/api/src/configure-app';

let server: express.Express | null = null;

async function getServer() {
  if (server) {
    return server;
  }

  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log']
  });

  configureApp(nestApp);
  await nestApp.init();
  server = expressApp;
  return server;
}

export default async function handler(request: express.Request, response: express.Response) {
  const app = await getServer();
  return app(request, response);
}
