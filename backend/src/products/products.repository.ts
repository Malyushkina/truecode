import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';

/**
 * Репозиторий для работы с товарами в базе данных
 * Содержит методы для CRUD операций и поиска
 * Использует Prisma для работы с PostgreSQL
 */
@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Создает новый товар в базе данных
   * @param data - данные товара для создания
   * @returns созданный товар
   */
  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  /**
   * Получает список товаров с пагинацией, фильтрацией и сортировкой
   * @param query - параметры запроса (поиск, сортировка, пагинация)
   * @returns объект с товарами и общим количеством
   */
  async findMany(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = query;

    // Вычисляем количество записей для пропуска (пагинация)
    const skip = (page - 1) * limit;

    // Строим условия для фильтрации
    const where = this.buildWhereClause(search, minPrice, maxPrice);

    // Параллельно получаем товары и общее количество
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * Находит товар по уникальному идентификатору
   * @param uid - уникальный UID товара
   * @returns найденный товар или null
   */
  async findByUid(uid: string) {
    return this.prisma.product.findUnique({ where: { uid } });
  }

  /**
   * Обновляет существующий товар
   * @param uid - уникальный UID товара
   * @param data - данные для обновления
   * @returns обновленный товар
   */
  async updateByUid(uid: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { uid },
      data,
    });
  }

  /**
   * Удаляет товар из базы данных
   * @param uid - уникальный UID товара
   * @returns удаленный товар
   */
  async deleteByUid(uid: string) {
    return this.prisma.product.delete({ where: { uid } });
  }

  /**
   * Строит условия для фильтрации товаров
   * @param search - поисковый запрос
   * @param minPrice - минимальная цена
   * @param maxPrice - максимальная цена
   * @returns объект условий для Prisma
   */
  private buildWhereClause(
    search?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [];

    // Добавляем поиск по названию, описанию и артикулу
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Добавляем фильтрацию по цене
    if (minPrice || maxPrice) {
      const priceCondition: Prisma.FloatFilter = {};
      if (minPrice && !isNaN(minPrice)) priceCondition.gte = minPrice;
      if (maxPrice && !isNaN(maxPrice)) priceCondition.lte = maxPrice;
      if (Object.keys(priceCondition).length > 0) {
        conditions.push({ price: priceCondition });
      }
    }

    // Возвращаем условия для Prisma
    return conditions.length > 0 ? { AND: conditions } : {};
  }
}
