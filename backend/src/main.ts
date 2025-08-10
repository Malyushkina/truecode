import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import express from 'express';
import { join } from 'path';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpExceptionFilter } from './common/http-exception.filter';

/**
 * Точка входа в приложение
 * Создает и запускает NestJS приложение
 */
async function bootstrap() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
      console.log('🚀 Запуск приложения...');
      console.log('📊 Переменные окружения:');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('PORT:', process.env.PORT);
      console.log(
        'DATABASE_URL:',
        process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      );
    }

    const app = await NestFactory.create(AppModule);
    if (!isProd) console.log('✅ NestJS приложение создано');

    // Глобальный фильтр исключений
    app.useGlobalFilters(new HttpExceptionFilter());

    // Получаем разрешенные origins из переменных окружения
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3002',
          'http://localhost:3001',
          'https://truecode-o6h8-8bbajkwz7-evgs-projects-ab81fb84.vercel.app',
          'https://truecode-frontend.vercel.app',
        ];

    if (!isProd) console.log('🌍 Allowed Origins:', allowedOrigins);

    // Настраиваем CORS для разрешения запросов только из доверенных источников
    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Разрешаем запросы без Origin (например, из curl/Postman)
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };
    app.enableCors(corsOptions);

    // Раздача статики из папки uploads
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

    // Добавляем глобальную валидацию
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // Автоматически преобразует входящие данные в типы DTO
        whitelist: true, // Удаляет свойства, отсутствующие в DTO
        forbidNonWhitelisted: true, // Запрещает свойства, отсутствующие в DTO
      }),
    );

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    if (!isProd) {
      console.log(`🚀 Приложение запущено на порту ${port}`);
      console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
    }
  } catch (error) {
    console.error('❌ Ошибка запуска приложения:', error);
    process.exit(1);
  }
}

// Запускаем приложение
bootstrap().catch((error) => {
  console.error('Ошибка запуска приложения:', error);
  process.exit(1);
});
