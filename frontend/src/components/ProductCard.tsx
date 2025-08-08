'use client';

import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Eye, Edit, Trash2, ImagePlus, ImageOff } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

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

  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<null | {
    type: 'error' | 'success';
    text: string;
  }>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    // Клиентская валидация файла
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    if (!file.type || !allowed.includes(file.type)) {
      setNotice({
        type: 'error',
        text: 'Неверный тип файла. Допустимы: JPG, PNG, WEBP, GIF, SVG.',
      });
      e.target.value = '';
      return;
    }
    if (file.size === 0) {
      setNotice({
        type: 'error',
        text: 'Файл пустой (0 байт). Выберите другой файл.',
      });
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice({
        type: 'error',
        text: 'Файл слишком большой. Максимум 10 МБ.',
      });
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      await productsApi.uploadImage(product.uid, file);
      setNotice({ type: 'success', text: 'Изображение загружено.' });
      // простое обновление страницы, чтобы не тащить стейт
      window.location.reload();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          'Не удалось загрузить изображение.'
        : 'Не удалось загрузить изображение.';
      setNotice({ type: 'error', text: message });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    try {
      await productsApi.deleteImage(product.uid);
      setNotice({ type: 'success', text: 'Изображение удалено.' });
      window.location.reload();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          'Не удалось удалить изображение.'
        : 'Не удалось удалить изображение.';
      setNotice({ type: 'error', text: message });
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      {/* Изображение товара */}
      <div className='aspect-square bg-gray-100 flex items-center justify-center relative'>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
            priority={false}
          />
        ) : (
          <div className='text-gray-400 text-4xl'>📷</div>
        )}

        {/* Кнопки управления фото */}
        <div className='absolute bottom-2 right-2 flex gap-2'>
          <label className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 border rounded cursor-pointer hover:bg-white'>
            <ImagePlus size={14} />
            {isUploading ? 'Загрузка...' : 'Загрузить'}
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />
          </label>

          {product.imageUrl && (
            <button
              onClick={handleDeleteImage}
              className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 border rounded hover:bg-white text-red-600'
            >
              <ImageOff size={14} /> Удалить
            </button>
          )}
        </div>
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
