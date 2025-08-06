import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Точка входа в приложение
 * Создает и запускает NestJS приложение
 */
async function bootstrap() {
  // Создаем экземпляр приложения из главного модуля
  const app = await NestFactory.create(AppModule);

  // Добавляем глобальную валидацию
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Запускаем сервер на указанном порту
  // Если PORT не указан в переменных окружения, используем 3000
  await app.listen(process.env.PORT ?? 3000);
}

// Запускаем приложение
void bootstrap();
