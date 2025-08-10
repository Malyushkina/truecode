import { IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для обновления товара
 * Ослабленная валидация относительно CreateProductDto:
 * - только проверки типов
 * - без ограничений длины/минимальных значений
 * - пустые строки для name/sku трактуются как отсутствие значения
 */
export class UpdateProductDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value === 'string') {
      const v = value.trim();
      return v === '' ? undefined : v;
    }
    return value; // не строка — не трогаем, пусть @IsString отловит
  })
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value === 'string') {
      const v = value.trim();
      return v === '' ? undefined : v;
    }
    return value;
  })
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
