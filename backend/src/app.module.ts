import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';

/**
 * Главный модуль приложения
 * Объединяет все модули и компоненты приложения
 * Является корневым модулем NestJS приложения
 */
@Module({
  imports: [
    PrismaModule, // Модуль для работы с базой данных
    ProductsModule, // Модуль для работы с товарами
  ],
  controllers: [AppController], // Главный контроллер приложения
  providers: [AppService], // Главный сервис приложения
})
export class AppModule {}
