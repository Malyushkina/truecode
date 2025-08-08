import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';

/**
 * Модуль товаров
 * Объединяет контроллер, сервис и репозиторий
 * Предоставляет функциональность для работы с товарами
 */
@Module({
  controllers: [ProductsController], // Контроллер для обработки HTTP запросов
  providers: [ProductsService, ProductsRepository], // Сервисы для бизнес-логики и работы с БД
})
export class ProductsModule {}
 