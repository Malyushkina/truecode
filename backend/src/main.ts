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
  // Создаем экземпляр приложения из главного модуля
  const app = await NestFactory.create(AppModule);

  // Получаем разрешенные origins из переменных окружения
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3001',
        'https://your-frontend-domain.vercel.app', // Замените на ваш домен
        'https://truecode-frontend.vercel.app', // Пример домена
      ];

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

  // Запускаем сервер на указанном порту
  // Если PORT не указан в переменных окружения, используем 3000
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Приложение запущено на порту ${port}`);
  console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
}

// Запускаем приложение
bootstrap().catch((error) => {
  console.error('Ошибка запуска приложения:', error);
  process.exit(1);
});
