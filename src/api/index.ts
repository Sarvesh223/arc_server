import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import * as express from 'express';
import { Request, Response, Express } from 'express';

// Define a type for the Express handler function
type ExpressHandler = (req: Request, res: Response) => void;

const expressApp: Express = express();
let app: INestApplication | null = null;

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    await app.init();
  }

  // Use type assertion to properly type the Express instance
  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance() as ExpressHandler;

  // Call the Express instance with the request and response
  expressInstance(req, res);
}
