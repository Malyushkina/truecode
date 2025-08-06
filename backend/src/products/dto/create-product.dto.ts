import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO (Data Transfer Object) для создания нового товара
 * Используется для валидации данных при создании товара через API
 */
export class CreateProductDto {
  /** Название товара (обязательное поле) */
  @IsString()
  name: string;

  /** Подробное описание товара (необязательное поле) */
  @IsOptional()
  @IsString()
  description?: string;

  /** Основная цена товара в рублях (обязательное поле) */
  @IsNumber()
  price: number;

  /** Цена товара со скидкой (необязательное поле) */
  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  /** Артикул товара - уникальный код (обязательное поле) */
  @IsString()
  sku: string;

  /** URL фотографии товара (необязательное поле) */
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
