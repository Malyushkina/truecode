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
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:3002';

const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  console.log('🔧 API Base URL:', apiBaseUrl);
  console.log('🔧 Environment:', process.env.NODE_ENV);
  console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}

// removed hard error on localhost to allow local testing

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

function isCanceledError(error: unknown): boolean {
  // Axios v1: code === 'ERR_CANCELED' + AbortController name/message
  const e = error as { code?: string; name?: string; message?: string };
  const canceledByAxios =
    typeof (axios as unknown as { isCancel?: (err: unknown) => boolean })
      .isCancel === 'function'
      ? (axios.isCancel as (err: unknown) => boolean)(error)
      : false;
  const msg = typeof e?.message === 'string' ? e.message.toLowerCase() : '';
  return (
    canceledByAxios ||
    e?.code === 'ERR_CANCELED' ||
    e?.name === 'CanceledError' ||
    msg.includes('canceled') ||
    msg.includes('aborted')
  );
}

// Минимальный тип ошибки от axios для логирования без any
type AxiosLikeError = {
  response?: { status?: number };
  message?: string;
};

// Добавляем перехватчик для отладки
api.interceptors.request.use(
  (config) => {
    if (isDev)
      console.log('🌐 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    if (isDev && !isCanceledError(error))
      console.warn('⚠️ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (isDev)
      console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosLikeError) => {
    if (isDev && !isCanceledError(error)) {
      const status = error?.response?.status;
      console.warn('⚠️ Response Error:', status, error?.message);
    }
    return Promise.reject(error);
  }
);

/**
 * API функции для работы с товарами
 */
export const productsApi = {
  /**
   * Получить список товаров с пагинацией и фильтрацией
   */
  async getProducts(
    query: QueryProductsDto = {},
    opts?: { signal?: AbortSignal }
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.minPrice) params.append('minPrice', query.minPrice.toString());
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());

    if (isDev) {
      console.log(
        '🌐 API Request:',
        `${apiBaseUrl}/products?${params.toString()}`
      );
    }

    try {
      const response = await api.get(`/products?${params.toString()}`, {
        signal: opts?.signal,
      });
      if (isDev) console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      if (isDev && !isCanceledError(error))
        console.warn('⚠️ API Error:', error);
      throw error;
    }
  },

  /**
   * Получить товар по UID
   */
  async getProduct(
    uid: string,
    opts?: { signal?: AbortSignal }
  ): Promise<Product> {
    try {
      const response = await api.get(`/products/${uid}`, {
        signal: opts?.signal,
      });
      return response.data;
    } catch (error) {
      if (isDev && !isCanceledError(error))
        console.warn('⚠️ API Error:', error);
      throw error;
    }
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
