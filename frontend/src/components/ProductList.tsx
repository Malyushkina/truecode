import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-xl font-semibold text-gray-600 mb-2'>
          Товары не найдены
        </h2>
        <p className='text-gray-500'>Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
      {/* Header: показываем только на больших экранах */}
      <div className='hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500'>
        <div className='col-span-2'>Фото</div>
        <div className='col-span-4'>Название</div>
        <div className='col-span-3'>Цена со скидкой</div>
        <div className='col-span-2'>Цена без скидки</div>
        <div className='col-span-1 text-right'>Артикул</div>
      </div>
      <ul className='divide-y divide-gray-200'>
        {products.map((product) => {
          const hasDiscount =
            product.discountPrice && product.discountPrice < product.price;
          return (
            <li key={product.id} className='hover:bg-gray-50'>
              <Link
                href={`/products/${product.uid}`}
                className='px-4 py-2 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 sm:h-16 items-center'
              >
                {/* Фото */}
                <div className='sm:col-span-2 w-full sm:w-auto'>
                  <div className='w-16 h-16 sm:w-14 sm:h-14 relative bg-gray-100 rounded overflow-hidden mx-auto sm:mx-0'>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes='80px'
                        className='object-contain'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400 text-2xl'>
                        📷
                      </div>
                    )}
                  </div>
                </div>

                {/* Правая колонка: название, описание, нижняя строка */}
                <div className='sm:col-span-10 lg:col-span-4 w-full text-center sm:text-left'>
                  <div className='font-medium text-gray-900 truncate lg:whitespace-nowrap'>
                    {product.name}
                  </div>
                  {product.description && (
                    <div className='text-sm text-gray-500 mt-1 line-clamp-1 sm:line-clamp-1 lg:hidden'>
                      {product.description}
                    </div>
                  )}
                  {/* Нижняя строка: цена(со скидкой) + цена без скидки + SKU (на sm..md) */}
                  <div className='mt-2 flex items-center justify-between text-sm lg:hidden w-full'>
                    <div className='flex items-center gap-2'>
                      {hasDiscount ? (
                        <>
                          <span className='font-semibold text-red-600'>
                            {formatPrice(product.discountPrice!)}
                          </span>
                          <span className='text-gray-900'>
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className='font-semibold text-gray-900'>
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <div className='text-gray-600 truncate'>
                      <span className='hidden sm:inline'>Артикул: </span>
                      {product.sku}
                    </div>
                  </div>
                </div>

                {/* Цена со скидкой для десктопа */}
                <div className='hidden lg:flex lg:col-span-3 items-center truncate'>
                  {hasDiscount ? (
                    <span className='font-semibold text-red-600'>
                      {formatPrice(product.discountPrice!)}
                    </span>
                  ) : (
                    <span className='text-gray-700'>—</span>
                  )}
                </div>

                {/* Цена без скидки для десктопа */}
                <div className='hidden lg:flex lg:col-span-2 items-center truncate'>
                  <span className='font-semibold text-gray-900'>
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* SKU для десктопа */}
                <div className='hidden lg:flex lg:col-span-1 justify-end text-right text-sm text-gray-600 truncate'>
                  {product.sku}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
