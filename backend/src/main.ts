import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import express from 'express';
import { join } from 'path';

/**
 * Точка входа в приложение
 * Создает и запускает NestJS приложение
 */
async function bootstrap() {
  try {
    console.log('🚀 Запуск приложения...');
    console.log('📊 Переменные окружения:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

    const app = await NestFactory.create(AppModule);
    console.log('✅ NestJS приложение создано');

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

    console.log('🌍 Allowed Origins:', allowedOrigins);

    // Настраиваем CORS для разрешения запросов с frontend
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

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
    console.log(`🚀 Приложение запущено на порту ${port}`);
    console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
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
