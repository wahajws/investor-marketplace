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

function restoreRewrittenPath(request: express.Request) {
  const url = new URL(request.url, 'http://localhost');
  const path = url.searchParams.get('__path');

  if (!path) {
    return;
  }

  url.searchParams.delete('__path');
  const query = url.searchParams.toString();
  request.url = `/api/v1/${path}${query ? `?${query}` : ''}`;
}

export default async function handler(request: express.Request, response: express.Response) {
  restoreRewrittenPath(request);
  const app = await getServer();
  return app(request, response);
}
