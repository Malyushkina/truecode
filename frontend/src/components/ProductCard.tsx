'use client';

import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProductImage } from '@/hooks/use-product-image';
import ProductImageControls from '@/components/ProductImageControls';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

/**
 * Карточка товара для отображения в каталоге
 */
export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  const [notice, setNotice] = useState<null | {
    type: 'error' | 'success';
    text: string;
  }>(null);
  const { upload, removeImage, isUploading, error } = useProductImage(
    product.uid
  );
  useEffect(() => {
    if (error) setNotice({ type: 'error', text: error });
    else setNotice(null);
  }, [error]);

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      {/* Изображение товара */}
      <div className='aspect-square bg-gray-100 flex items-center justify-center relative'>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-contain'
            sizes='64px'
            priority={false}
          />
        ) : (
          <div className='text-gray-400 text-4xl'>📷</div>
        )}
        <ProductImageControls
          imageUrl={product.imageUrl}
          isUploading={isUploading}
          disabled={false}
          onUpload={upload}
          onDelete={removeImage}
        />
      </div>

      {/* Информация о товаре */}
      <div className='p-4'>
        {notice && (
          <div
            className={`mb-2 text-sm ${
              notice.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {notice.text}
          </div>
        )}
        <h3 className='font-semibold text-lg text-gray-900 mb-2 line-clamp-2'>
          {product.name}
        </h3>

        {product.description && (
          <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
            {product.description}
          </p>
        )}

        {/* Цена */}
        <div className='mb-3'>
          {hasDiscount ? (
            <div className='flex items-center gap-2'>
              <span className='text-lg font-bold text-red-600'>
                {formatPrice(product.discountPrice!)}
              </span>
              <span className='text-sm text-gray-500 line-through'>
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className='text-lg font-bold text-gray-900'>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Артикул */}
        <p className='text-xs text-gray-500 mb-4'>Артикул: {product.sku}</p>

        {/* Действия */}
        <div className='flex items-center justify-between'>
          <Link
            href={`/products/${product.uid}`}
            className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium'
          >
            <Eye size={16} />
            Просмотр
          </Link>

          <div className='flex items-center gap-2'>
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className='flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm'
              >
                <Edit size={16} />
                Изменить
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(product)}
                className='flex items-center gap-1 text-red-600 hover:text-red-800 text-sm'
              >
                <Trash2 size={16} />
                Удалить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
