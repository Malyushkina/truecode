'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProductDto } from '@/types/product';
import ConfirmModal from '@/components/ConfirmModal';
import { useProductImage } from '@/hooks/use-product-image';
import ProductImageControls from '@/components/ProductImageControls';
import Image from 'next/image';

/**
 * Страница отдельного товара
 */
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productUid = params.id as string;

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', productUid],
    queryFn: ({ signal }) => productsApi.getProduct(productUid, { signal }),
    enabled: !!productUid,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [sku, setSku] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [imageNotice, setImageNotice] = useState<null | {
    type: 'error' | 'success';
    text: string;
  }>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    upload,
    removeImage,
    isUploading: imgBusy,
    error: imgError,
  } = useProductImage(productUid);

  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setPrice(String(product.price ?? ''));
      setDiscountPrice(
        product.discountPrice !== undefined && product.discountPrice !== null
          ? String(product.discountPrice)
          : ''
      );
      setSku(product.sku ?? '');
      setFormError(null);
    }
  }, [product]);

  useEffect(() => {
    if (imgError) setImageNotice({ type: 'error', text: imgError });
    else setImageNotice(null);
  }, [imgError]);

  const { mutateAsync: saveAsync, isPending: isSaving } = useMutation({
    mutationFn: async (payload: UpdateProductDto) => {
      return productsApi.updateProduct(productUid, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product', productUid] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      setIsEditing(false);
    },
  });

  // Удаление товара
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useMutation({
    mutationFn: async () => productsApi.deleteProduct(productUid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/');
    },
  });

  const handleDeleteConfirmed = async () => {
    try {
      await deleteAsync();
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const handleSave = async () => {
    setFormError(null);
    // Простая валидация только при наличии значений
    const priceNum = price.trim() ? Number(price) : undefined;
    const discountNum = discountPrice.trim()
      ? Number(discountPrice)
      : undefined;

    if (
      priceNum !== undefined &&
      (!Number.isFinite(priceNum) || priceNum <= 0)
    ) {
      setFormError('Цена должна быть положительным числом');
      return;
    }
    if (
      discountNum !== undefined &&
      (!Number.isFinite(discountNum) || discountNum <= 0)
    ) {
      setFormError('Цена со скидкой должна быть положительным числом');
      return;
    }

    const payload: UpdateProductDto = {
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(description.trim()
        ? { description: description.trim() }
        : { description: '' as string | undefined }),
      ...(sku.trim() ? { sku: sku.trim() } : {}),
      ...(priceNum !== undefined ? { price: priceNum } : {}),
      ...(discountNum !== undefined
        ? { discountPrice: discountNum }
        : { discountPrice: undefined }),
    };

    try {
      await saveAsync(payload);
    } catch {
      setFormError('Не удалось сохранить изменения. Попробуйте позже.');
    }
  };

  const handleCancel = () => {
    // откатываем поля к исходным
    if (product) {
      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setPrice(String(product.price ?? ''));
      setDiscountPrice(
        product.discountPrice !== undefined && product.discountPrice !== null
          ? String(product.discountPrice)
          : ''
      );
      setSku(product.sku ?? '');
    }
    setIsEditing(false);
    setFormError(null);
  };

  const handleDeleteImage = async () => removeImage();

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
              onClick={() => router.push('/')}
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
          onClick={() => router.push('/')}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6'
        >
          <ArrowLeft size={20} />
          Назад к каталогу
        </button>

        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Изображение товара */}
            <div className='p-8'>
              {imageNotice?.type === 'error' && (
                <div className='mb-4 text-sm text-red-600'>
                  {imageNotice.text}
                </div>
              )}
              <div className='aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative'>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes='(min-width: 1024px) 50vw, 100vw'
                    className='object-contain rounded-lg'
                  />
                ) : (
                  <div className='text-gray-400 text-8xl'>📷</div>
                )}
                {isEditing && (
                  <ProductImageControls
                    imageUrl={product.imageUrl}
                    isUploading={imgBusy}
                    disabled={false}
                    onUpload={upload}
                    onDelete={handleDeleteImage}
                  />
                )}
              </div>
            </div>

            {/* Информация о товаре */}
            <div className='p-8'>
              {isEditing ? (
                <div className='mb-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Название
                    </label>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Описание
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Цена, ₽
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Цена со скидкой, ₽
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Артикул (SKU)
                    </label>
                    <input
                      type='text'
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  {formError && <div className='text-red-600'>{formError}</div>}
                </div>
              ) : (
                <div className='mb-6'>
                  <div className='mb-3'>
                    <span className='block text-sm font-medium text-gray-500 mb-1'>
                      Название
                    </span>
                    <h1 className='text-3xl font-bold text-gray-900'>
                      {product.name}
                    </h1>
                  </div>
                  {product.description && (
                    <div className='mt-4'>
                      <span className='block text-sm font-medium text-gray-500 mb-1'>
                        Описание
                      </span>
                      <p className='text-gray-600 text-lg'>
                        {product.description.length > 200 && !isDescExpanded
                          ? `${product.description.slice(0, 200)}…`
                          : product.description}
                      </p>
                      {product.description.length > 200 && (
                        <button
                          onClick={() => setIsDescExpanded((v) => !v)}
                          className='mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium'
                        >
                          {isDescExpanded ? 'Свернуть' : 'Читать дальше'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Цена */}
              {!isEditing && (
                <div className='mb-6'>
                  {hasDiscount ? (
                    <div className='space-y-2'>
                      <div>
                        <span className='block text-sm font-medium text-gray-500 mb-1'>
                          Цена со скидкой
                        </span>
                        <div className='text-3xl font-bold text-red-600'>
                          {formatPrice(product.discountPrice!)}
                        </div>
                      </div>
                      <div>
                        <span className='block text-sm font-medium text-gray-500 mb-1'>
                          Цена
                        </span>
                        <div className='text-xl text-gray-500 line-through'>
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      <div className='text-sm text-green-600 font-medium'>
                        Экономия:{' '}
                        {formatPrice(product.price - product.discountPrice!)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className='block text-sm font-medium text-gray-500 mb-1'>
                        Цена
                      </span>
                      <div className='text-3xl font-bold text-gray-900'>
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Детали товара */}
              {!isEditing && (
                <div className='space-y-4 mb-8'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      ID:
                    </span>
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
              )}

              {/* Действия */}
              <div className='flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4'>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className='w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
                    >
                      <Save size={20} />
                      {isSaving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className='w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50'
                    >
                      <X size={20} />
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className='w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                    >
                      <Edit size={20} />
                      Редактировать
                    </button>

                    <button
                      onClick={() => setIsDeleteOpen(true)}
                      disabled={isDeleting}
                      className='w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Trash2 size={20} />
                      {isDeleting ? 'Удаление…' : 'Удалить'}
                    </button>
                  </>
                )}
              </div>
              <ConfirmModal
                open={isDeleteOpen}
                title='Удалить товар?'
                description={
                  <span>
                    Действие необратимо. Товар будет безвозвратно удалён.
                  </span>
                }
                confirmText='Удалить'
                cancelText='Отмена'
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setIsDeleteOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
