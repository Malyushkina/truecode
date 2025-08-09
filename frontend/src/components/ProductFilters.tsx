'use client';

import { useState } from 'react';
import { QueryProductsDto } from '@/types/product';
import { Search, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  filters: QueryProductsDto;
  onFiltersChange: (filters: Partial<QueryProductsDto>) => void;
}

/**
 * Компонент фильтров для каталога товаров
 */
export default function ProductFilters({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value || undefined });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ sortOrder });
  };

  const handlePriceRangeChange = (minPrice?: number, maxPrice?: number) => {
    onFiltersChange({ minPrice, maxPrice });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minPrice: undefined,
      maxPrice: undefined,
    });
    setIsExpanded(false);
  };

  const hasActiveFilters =
    filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
      {/* Основная строка фильтров */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
        {/* Поиск */}
        <div className='flex-1 relative'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={20}
          />
          <input
            type='text'
            placeholder='Поиск товаров...'
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        {/* Сортировка */}
        <div className='flex gap-2'>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleSortChange(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='createdAt'>По дате</option>
            <option value='name'>По названию</option>
            <option value='price'>По цене</option>
          </select>

          <button
            onClick={() =>
              handleSortOrderChange(
                filters.sortOrder === 'asc' ? 'desc' : 'asc'
              )
            }
            className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Кнопка расширенных фильтров */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <Filter size={20} />
          Фильтры
        </button>

        {/* Количество на странице (вынесено из раскрытой секции) */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>На странице:</span>
          <select
            value={filters.limit || 12}
            onChange={(e) => {
              const val = Number(e.target.value);
              onFiltersChange({ limit: val === 0 ? 1000 : val });
            }}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value={0}>Все</option>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        {/* Очистить фильтры */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg'
          >
            <X size={20} />
            Очистить
          </button>
        )}
      </div>

      {/* Расширенные фильтры */}
      {isExpanded && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Диапазон цен */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Диапазон цен
              </label>
              <div className='flex gap-2'>
                <input
                  type='number'
                  placeholder='От'
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      e.target.value ? Number(e.target.value) : undefined,
                      filters.maxPrice
                    )
                  }
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <input
                  type='number'
                  placeholder='До'
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      filters.minPrice,
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Количество на странице — удалено из раскрытой секции */}
            {/* (перенесено в верхнюю строку рядом с кнопкой "Фильтры") */}
          </div>
        </div>
      )}
    </div>
  );
}
