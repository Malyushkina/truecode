import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

/**
 * Сервис для работы с товарами
 * Содержит бизнес-логику и обработку ошибок
 * Использует репозиторий для работы с базой данных
 */
@Injectable()
export class ProductsService {
  constructor(private repository: ProductsRepository) {}

  /**
   * Создает новый товар
   * @param createProductDto - данные для создания товара
   * @returns созданный товар
   */
  async create(createProductDto: CreateProductDto) {
    return this.repository.create(createProductDto);
  }

  /**
   * Получает список товаров с пагинацией
   * @param query - параметры запроса (поиск, сортировка, пагинация)
   * @returns объект с товарами и информацией о пагинации
   */
  async findAll(query: QueryProductsDto) {
    const { page = 1, limit = 10 } = query;
    const { products, total } = await this.repository.findMany(query);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Находит товар по ID
   * @param id - уникальный идентификатор товара
   * @returns найденный товар
   * @throws NotFoundException если товар не найден
   */
  async findOne(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    return product;
  }

  /**
   * Обновляет существующий товар
   * @param id - уникальный идентификатор товара
   * @param updateProductDto - данные для обновления
   * @returns обновленный товар
   * @throws NotFoundException если товар не найден
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Проверяем существование товара
    return this.repository.update(id, updateProductDto);
  }

  /**
   * Удаляет товар
   * @param id - уникальный идентификатор товара
   * @returns удаленный товар
   * @throws NotFoundException если товар не найден
   */
  async remove(id: string) {
    await this.findOne(id); // Проверяем существование товара
    return this.repository.delete(id);
  }
}
