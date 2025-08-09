import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { Product } from '@prisma/client';

/**
 * Сервис для работы с товарами
 * Содержит бизнес-логику и обработку ошибок
 * Использует репозиторий для работы с базой данных
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

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

  private ensureCloudinaryConfigured() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  private uploadBufferToCloudinary(buffer: Buffer, folder?: string) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err || !result)
            return reject(new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

  /**
   * Привязывает изображение к товару: загружает в Cloudinary, сохраняет URL/publicId
   */
  async attachImage(uid: string, file: { buffer: Buffer }) {
    this.ensureCloudinaryConfigured();
    const product: Product = await this.findOne(uid);

    // Удаляем предыдущее изображение в Cloudinary
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (error) {
        this.logger.warn(
          `Не удалось удалить предыдущее изображение: ${String(error)}`,
        );
      }
    }

    const folder = process.env.CLOUDINARY_FOLDER ?? 'products';
    const result = await this.uploadBufferToCloudinary(file.buffer, folder);

    return this.repository.updateByUid(uid, {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });
  }

  /**
   * Удаляет изображение у товара в Cloudinary
   */
  async detachImage(uid: string) {
    this.ensureCloudinaryConfigured();
    const product: Product = await this.findOne(uid);

    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (error) {
        this.logger.warn(
          `Не удалось удалить предыдущее изображение: ${String(error)}`,
        );
      }
    }

    return this.repository.updateByUid(uid, {
      imageUrl: null,
      imagePublicId: null,
    });
  }
}
