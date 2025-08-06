import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsString()
  sku: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
