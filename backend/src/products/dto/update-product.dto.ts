import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO для обновления товара
 * Наследует все поля от CreateProductDto, но делает их необязательными
 * Это позволяет обновлять только нужные поля товара
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
