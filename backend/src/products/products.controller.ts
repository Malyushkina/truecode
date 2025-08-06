import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

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
   * @param createProductDto - данные товара из тела запроса
   * @returns созданный товар
   */
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * GET /products
   * Получает список товаров с пагинацией, фильтрацией и сортировкой
   * @param query - параметры запроса из URL (page, limit, search, sortBy, etc.)
   * @returns объект с товарами и информацией о пагинации
   */
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  /**
   * GET /products/:id
   * Получает товар по уникальному идентификатору
   * @param id - ID товара из URL параметра
   * @returns найденный товар
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * PATCH /products/:id
   * Обновляет существующий товар
   * @param id - ID товара из URL параметра
   * @param updateProductDto - данные для обновления из тела запроса
   * @returns обновленный товар
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   * Удаляет товар
   * @param id - ID товара из URL параметра
   * @returns удаленный товар
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
