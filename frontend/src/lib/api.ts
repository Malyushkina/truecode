import axios from 'axios';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  ProductsResponse,
} from '@/types/product';

/**
 * API клиент для работы с backend
 * Использует axios для HTTP запросов
 */
const apiBaseUrl = 'https://truecode.onrender.com';
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API функции для работы с товарами
 */
export const productsApi = {
  /**
   * Получить список товаров с пагинацией и фильтрацией
   */
  async getProducts(query: QueryProductsDto = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.minPrice) params.append('minPrice', query.minPrice.toString());
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());

    console.log(
      '🌐 API Request:',
      `${apiBaseUrl}/products?${params.toString()}`
    );

    try {
      const response = await api.get(`/products?${params.toString()}`);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },

  /**
   * Получить товар по UID
   */
  async getProduct(uid: string): Promise<Product> {
    const response = await api.get(`/products/${uid}`);
    return response.data;
  },

  /**
   * Создать новый товар
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  /**
   * Обновить товар по UID
   */
  async updateProduct(uid: string, data: UpdateProductDto): Promise<Product> {
    const response = await api.patch(`/products/${uid}`, data);
    return response.data;
  },

  /**
   * Удалить товар по UID
   */
  async deleteProduct(uid: string): Promise<Product> {
    const response = await api.delete(`/products/${uid}`);
    return response.data;
  },

  /**
   * Загрузить изображение товара
   */
  async uploadImage(uid: string, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/products/${uid}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Удалить изображение товара
   */
  async deleteImage(uid: string): Promise<Product> {
    const response = await api.delete(`/products/${uid}/image`);
    return response.data;
  },
};

export default api;
