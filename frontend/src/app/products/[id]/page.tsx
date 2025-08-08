'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Страница отдельного товара
 */
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productUid = params.id as string;

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', productUid],
    queryFn: () => productsApi.getProduct(productUid),
    enabled: !!productUid,
  });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Товар не найден
            </h1>
            <p className='text-gray-600 mb-6'>
              Запрашиваемый товар не существует или был удален.
            </p>
            <button
              onClick={() => router.back()}
              className='flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <ArrowLeft size={20} />
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Кнопка назад */}
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6'
        >
          <ArrowLeft size={20} />
          Назад к каталогу
        </button>

        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Изображение товара */}
            <div className='p-8'>
              <div className='aspect-square bg-gray-100 rounded-lg flex items-center justify-center'>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className='w-full h-full object-cover rounded-lg'
                  />
                ) : (
                  <div className='text-gray-400 text-8xl'>📷</div>
                )}
              </div>
            </div>

            {/* Информация о товаре */}
            <div className='p-8'>
              <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                  {product.name}
                </h1>

                {product.description && (
                  <p className='text-gray-600 text-lg mb-6'>
                    {product.description}
                  </p>
                )}
              </div>

              {/* Цена */}
              <div className='mb-6'>
                {hasDiscount ? (
                  <div className='space-y-2'>
                    <div className='text-3xl font-bold text-red-600'>
                      {formatPrice(product.discountPrice!)}
                    </div>
                    <div className='text-xl text-gray-500 line-through'>
                      {formatPrice(product.price)}
                    </div>
                    <div className='text-sm text-green-600 font-medium'>
                      Экономия:{' '}
                      {formatPrice(product.price - product.discountPrice!)}
                    </div>
                  </div>
                ) : (
                  <div className='text-3xl font-bold text-gray-900'>
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Детали товара */}
              <div className='space-y-4 mb-8'>
                <div>
                  <span className='text-sm font-medium text-gray-500'>ID:</span>
                  <span className='ml-2 text-gray-900'>{product.id}</span>
                </div>

                <div>
                  <span className='text-sm font-medium text-gray-500'>
                    UID:
                  </span>
                  <span className='ml-2 text-gray-900'>{product.uid}</span>
                </div>

                <div>
                  <span className='text-sm font-medium text-gray-500'>
                    Артикул:
                  </span>
                  <span className='ml-2 text-gray-900'>{product.sku}</span>
                </div>

                <div>
                  <span className='text-sm font-medium text-gray-500'>
                    Дата создания:
                  </span>
                  <span className='ml-2 text-gray-900'>
                    {formatDate(product.createdAt)}
                  </span>
                </div>

                <div>
                  <span className='text-sm font-medium text-gray-500'>
                    Последнее обновление:
                  </span>
                  <span className='ml-2 text-gray-900'>
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Действия */}
              <div className='flex gap-4'>
                <button className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
                  <Edit size={20} />
                  Редактировать
                </button>

                <button className='flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700'>
                  <Trash2 size={20} />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
