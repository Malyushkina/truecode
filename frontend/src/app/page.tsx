'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { QueryProductsDto } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
    retry: 1,
  });

  // Отладочная информация
  console.log('Query state:', { data, isLoading, error });

  const handleFiltersChange = (newFilters: Partial<QueryProductsDto>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading) {
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
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Каталог товаров
          </h1>
          <p className='text-gray-600'>
            Найдено товаров: {data?.pagination.total || 0}
          </p>
        </div>

        {/* Фильтры */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Список товаров */}
        {data?.products.length === 0 ? (
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-gray-600 mb-2'>
              Товары не найдены
            </h2>
            <p className='text-gray-500'>
              Попробуйте изменить параметры поиска
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
            {data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {data && data.pagination.pages > 1 && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
