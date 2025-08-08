import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { promises as fs } from 'fs';
import { join } from 'path';

type UploadedFileInfo = { filename: string };

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
   * Находит товар по UID
   * @param uid - уникальный строковый идентификатор товара
   * @returns найденный товар
   * @throws NotFoundException если товар не найден
   */
  async findOne(uid: string) {
    const product = await this.repository.findByUid(uid);

    if (!product) {
      throw new NotFoundException(`Товар с UID ${uid} не найден`);
    }

    return product;
  }

  /**
   * Обновляет существующий товар
   */
  async update(uid: string, updateProductDto: UpdateProductDto) {
    await this.findOne(uid); // Проверяем существование товара

    return this.repository.updateByUid(uid, updateProductDto);
  }

  /**
   * Удаляет товар
   */
  async remove(uid: string) {
    await this.findOne(uid); // Проверяем существование товара

    return this.repository.deleteByUid(uid);
  }

  /**
   * Привязывает изображение к товару: сохраняет URL и удаляет предыдущее
   */
  async attachImage(uid: string, file: UploadedFileInfo) {
    const product = await this.findOne(uid);

    // Удаляем предыдущее изображение, если было
    await this.deleteLocalImageFileIfExists(product.imageUrl);

    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3002';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return this.repository.updateByUid(uid, { imageUrl });
  }

  /**
   * Удаляет изображение у товара и чистит файл на диске
   */
  async detachImage(uid: string) {
    const product = await this.findOne(uid);

    await this.deleteLocalImageFileIfExists(product.imageUrl);

    // Принудительно задаем null в imageUrl
    return this.repository.updateByUid(uid, { imageUrl: null });
  }

  private async deleteLocalImageFileIfExists(imageUrl?: string | null) {
    if (!imageUrl) return;

    const uploadsMarker = '/uploads/';
    const markerIndex = imageUrl.indexOf(uploadsMarker);
    if (markerIndex === -1) return;

    const filename = imageUrl.substring(markerIndex + uploadsMarker.length);
    const filePath = join(process.cwd(), 'uploads', filename);

    try {
      await fs.unlink(filePath);
    } catch {
      // игнорируем, если файла нет
    }
  }
}
