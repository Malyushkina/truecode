import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Перечисление для направления сортировки
 */
export enum SortOrder {
  ASC = 'asc', // По возрастанию
  DESC = 'desc', // По убыванию
}

/**
 * DTO для параметров запроса списка товаров
 * Используется для пагинации, фильтрации и сортировки
 */
export class QueryProductsDto {
  /** Номер страницы (по умолчанию 1) */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value as string);
    return isNaN(parsed) ? 1 : parsed;
  })
  @IsNumber()
  page?: number = 1;

  /** Количество товаров на странице (по умолчанию 10) */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value as string);
    return isNaN(parsed) ? 10 : parsed;
  })
  @IsNumber()
  limit?: number = 10;

  /** Поисковый запрос (поиск по названию, описанию, артикулу) */
  @IsOptional()
  @IsString()
  search?: string;

  /** Поле для сортировки (по умолчанию createdAt) */
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  /** Направление сортировки (по умолчанию DESC) */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  /** Минимальная цена для фильтрации */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseFloat(value as string);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber()
  minPrice?: number;

  /** Максимальная цена для фильтрации */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseFloat(value as string);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber()
  maxPrice?: number;
}
