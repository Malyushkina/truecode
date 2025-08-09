'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { QueryProductsDto } from '@/types/product';
import ProductFilters from '@/components/ProductFilters';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import ProductList from '@/components/ProductList';

/**
 * Главная страница с каталогом товаров
 */
export default function HomePage() {
  const [filters, setFilters] = useState<QueryProductsDto>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Отладочная информация
  console.log('🔧 Component loaded');
  console.log('🔧 API URL from lib:', process.env.NEXT_PUBLIC_API_URL);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
    retry: 1,
    placeholderData: (prev) => prev,
  });

  // Отладочная информация
  console.log('Query state:', { data, isLoading, isFetching, error });

  const handleFiltersChange = (newFilters: Partial<QueryProductsDto>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading && !data) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Ошибка загрузки товаров
            </h1>
            <p className='text-gray-600'>
              Не удалось загрузить каталог товаров. Попробуйте обновить
              страницу.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Заголовок */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Каталог товаров
            </h1>
            <p className='text-gray-600'>
              Найдено товаров: {data?.pagination.total || 0}
            </p>
          </div>
          <Link
            href='/products/new'
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Создать товар
          </Link>
        </div>

        {/* Фильтры */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Список товаров */}
        {data && (
          <div
            className='mb-6'
            style={{ minHeight: `${(filters.limit ?? 12) * 64 + 48}px` }}
          >
            <ProductList products={data.products} />
          </div>
        )}

        {/* Пагинация */}
        {data && data.pagination.pages > 1 && (
          <div className='mt-6'>
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Небольшой индикатор фоновой загрузки */}
        {isFetching && (
          <div className='mt-4 text-sm text-gray-500'>Обновляем список…</div>
        )}
      </div>
    </div>
  );
}
