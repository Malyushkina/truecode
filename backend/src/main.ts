import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Точка входа в приложение
 * Создает и запускает NestJS приложение
 */
async function bootstrap() {
  // Создаем экземпляр приложения из главного модуля
  const app = await NestFactory.create(AppModule);

  // Запускаем сервер на указанном порту
  // Если PORT не указан в переменных окружения, используем 3000
  await app.listen(process.env.PORT ?? 3000);
}

// Запускаем приложение
bootstrap();
