import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Глобальный модуль Prisma
 * Предоставляет PrismaService для всего приложения
 * @Global() - делает модуль глобальным, доступным во всех модулях
 */
@Global()
@Module({
  providers: [PrismaService], // Регистрируем PrismaService как провайдер
  exports: [PrismaService], // Экспортируем для использования в других модулях
})
export class PrismaModule {}
