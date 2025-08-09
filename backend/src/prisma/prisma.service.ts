import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Сервис для работы с базой данных через Prisma
 * Наследует PrismaClient и добавляет жизненный цикл NestJS
 * Автоматически подключается при старте приложения и отключается при завершении
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    });
    // Явно логируем использованный URL
    // В тестах лог подавляем
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('📦 Prisma DATABASE_URL:', process.env.DATABASE_URL);
    }
  }

  /**
   * Вызывается при инициализации модуля
   * Устанавливает соединение с базой данных
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Вызывается при уничтожении модуля
   * Закрывает соединение с базой данных
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
