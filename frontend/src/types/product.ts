/**
 * Типы для работы с товарами
 */

export interface Product {
  id: number;
  uid: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  sku: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  sku: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  sku?: string;
  imageUrl?: string;
}

export interface QueryProductsDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
}
