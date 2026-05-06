import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/transform/transform.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.use(cookieParser());
  
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(new ValidationPipe({

    whitelist: true,
    transform: true,
  }));

  app.enableCors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.replace(/"/g, '').trim()),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 3000;
  
  // 🛡️ Khiên bảo vệ: Ngăn chặn tuyệt đối việc sập App do lỗi Redis hoặc lỗi không mong muốn
  process.on('uncaughtException', (err) => {
    console.error('[Critical] Uncaught Exception:', err.message);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Critical] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  await app.listen(port, '0.0.0.0');
  console.log(`BFF is listening on port: ${port}`);
}
bootstrap();

