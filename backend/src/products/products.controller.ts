import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

// Локальный минимальный тип файла с буфером
type UploadedFileBuffer = { buffer: Buffer };

/**
 * Контроллер для работы с товарами
 * Предоставляет REST API endpoints для CRUD операций
 * Базовый путь: /products
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * POST /products
   * Создает новый товар
   */
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * POST /products/:uid/image
   * Загружает изображение для товара
   */
  @Post(':uid/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
        ];
        cb(null, !!file?.mimetype && allowed.includes(file.mimetype));
      },
    }),
  )
  async uploadImage(
    @Param('uid') uid: string,
    @UploadedFile() file?: UploadedFileBuffer,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Неверный тип файла. Допустимы: jpg, png, webp, gif, svg.',
      );
    }
    return this.productsService.attachImage(uid, file);
  }

  /**
   * DELETE /products/:uid/image
   * Удаляет изображение у товара
   */
  @Delete(':uid/image')
  async deleteImage(@Param('uid') uid: string) {
    return await this.productsService.detachImage(uid);
  }

  /**
   * GET /products
   */
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  /**
   * GET /products/:uid
   */
  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.productsService.findOne(uid);
  }

  /**
   * PATCH /products/:uid
   */
  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(uid, updateProductDto);
  }

  /**
   * DELETE /products/:uid
   */
  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.productsService.remove(uid);
  }
}
