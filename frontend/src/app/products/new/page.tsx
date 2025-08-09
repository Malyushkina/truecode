'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import type { CreateProductDto, Product } from '@/types/product';
import ProductForm from '@/components/ProductForm';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { validateImageFile, processImage } from '@/lib/image-validation';

export default function NewProductPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<{
    name?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    sku?: string;
  }>({});
  const [isImgUploading, setIsImgUploading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: CreateProductDto) => {
      const created: Product = await productsApi.createProduct(payload);
      return created;
    },
    onSuccess: (product) => {
      router.push(`/products/${product.uid}`);
    },
  });

  const requiredFilled = Boolean(draft.name && draft.price && draft.sku);

  const handleCreateAndUpload = async (file: File) => {
    if (!requiredFilled || isImgUploading) return;
    try {
      setIsImgUploading(true);
      const payload: CreateProductDto = {
        name: draft.name!,
        price: draft.price!,
        sku: draft.sku!,
        ...(draft.description ? { description: draft.description } : {}),
        ...(draft.discountPrice !== undefined
          ? { discountPrice: draft.discountPrice }
          : {}),
      };
      const created = await productsApi.createProduct(payload);
      const processed = await processImage(file);
      const toUpload = processed.ok ? processed.file : file;
      await productsApi.uploadImage(created.uid, toUpload as File);
      router.push(`/products/${created.uid}`);
    } catch (e) {
      alert(
        'Не удалось создать товар или загрузить изображение. Попробуйте позже.'
      );
    } finally {
      setIsImgUploading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Создать товар
            </h1>
            <p className='text-gray-600'>
              Заполните форму ниже и нажмите «Сохранить»
            </p>
          </div>
          <Link
            href='/'
            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
          >
            Назад к каталогу
          </Link>
        </div>

        <ProductForm
          mode='create'
          initialValues={{}}
          isSubmitting={isPending}
          submitLabel='Сохранить'
          cancelLabel='Отмена'
          imageUrl={undefined}
          imageActions={
            <div className='flex items-center gap-2'>
              {requiredFilled ? (
                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded ${
                    !isImgUploading
                      ? 'bg-white/90 cursor-pointer hover:bg-white'
                      : 'bg-white/90 cursor-not-allowed opacity-60'
                  }`}
                >
                  <ImagePlus size={16} />{' '}
                  {isImgUploading ? 'Загрузка…' : 'Загрузить'}
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    disabled={isImgUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const valid = validateImageFile(f);
                        if (!valid.ok) {
                          alert(valid.error);
                        } else {
                          handleCreateAndUpload(f);
                        }
                      }
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              ) : (
                <span className='text-xs text-gray-500'>
                  Заполните обязательные поля, чтобы добавить фото
                </span>
              )}
            </div>
          }
          onSubmit={async (values) => {
            const payload: CreateProductDto = {
              name: values.name!,
              price: values.price!,
              sku: values.sku!,
              ...(values.description
                ? { description: values.description }
                : {}),
              ...(values.discountPrice !== undefined
                ? { discountPrice: values.discountPrice }
                : {}),
            };
            await mutateAsync(payload);
          }}
          onCancel={() => router.push('/')}
          onChange={(vals) =>
            setDraft({
              name: vals.name,
              description: vals.description,
              price: vals.price,
              discountPrice: vals.discountPrice,
              sku: vals.sku,
            })
          }
        />
      </div>
    </div>
  );
}
