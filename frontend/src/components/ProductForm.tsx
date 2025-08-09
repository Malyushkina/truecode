import { useState } from 'react';

export type ProductFormMode = 'create' | 'edit';

export interface ProductFormInitialValues {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  sku?: string;
}

export interface ProductFormProps {
  mode: ProductFormMode;
  initialValues?: ProductFormInitialValues;
  imageUrl?: string | null;
  imageActions?: React.ReactNode; // e.g., upload/delete buttons for edit mode
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: {
    name?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    sku?: string;
  }) => Promise<void> | void;
  onCancel?: () => void;
  onChange?: (values: {
    name?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    sku?: string;
  }) => void;
}

export default function ProductForm({
  mode,
  initialValues,
  imageUrl,
  imageActions,
  submitLabel,
  cancelLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  onChange,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [price, setPrice] = useState(
    initialValues?.price !== undefined ? String(initialValues.price) : ''
  );
  const [discountPrice, setDiscountPrice] = useState(
    initialValues?.discountPrice !== undefined
      ? String(initialValues.discountPrice)
      : ''
  );
  const [sku, setSku] = useState(initialValues?.sku ?? '');

  const [formError, setFormError] = useState<string | null>(null);

  const emitChange = (
    next?: Partial<{
      name: string;
      description: string;
      price: string;
      discountPrice: string;
      sku: string;
    }>
  ) => {
    if (!onChange) return;
    const final = {
      name: (next?.name ?? name) || undefined,
      description: (next?.description ?? description) || undefined,
      price: next?.price ?? price ? Number(next?.price ?? price) : undefined,
      discountPrice:
        next?.discountPrice ?? discountPrice
          ? Number(next?.discountPrice ?? discountPrice)
          : undefined,
      sku: (next?.sku ?? sku) || undefined,
    };
    onChange(final);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = price.trim() ? Number(price) : undefined;
    const discountNum = discountPrice.trim()
      ? Number(discountPrice)
      : undefined;

    if (mode === 'create') {
      if (!name.trim()) return setFormError('Введите название товара');
      if (!sku.trim()) return setFormError('Введите артикул (SKU)');
      if (!priceNum || !Number.isFinite(priceNum) || priceNum <= 0)
        return setFormError('Цена должна быть положительным числом');
    } else {
      // edit mode: валидация чисел только если заданы
      if (
        priceNum !== undefined &&
        (!Number.isFinite(priceNum) || priceNum <= 0)
      )
        return setFormError('Цена должна быть положительным числом');
      if (
        discountNum !== undefined &&
        (!Number.isFinite(discountNum) || discountNum <= 0)
      )
        return setFormError('Цена со скидкой должна быть положительным числом');
    }

    const payload: {
      name?: string;
      description?: string;
      price?: number;
      discountPrice?: number;
      sku?: string;
    } = {};

    if (mode === 'create') {
      payload.name = name.trim();
      payload.sku = sku.trim();
      payload.price = priceNum!;
      if (description.trim()) payload.description = description.trim();
      if (discountNum !== undefined) payload.discountPrice = discountNum;
    } else {
      if (name.trim()) payload.name = name.trim();
      // позволяем очистить описание
      payload.description = description.trim() ? description.trim() : '';
      if (sku.trim()) payload.sku = sku.trim();
      if (priceNum !== undefined) payload.price = priceNum;
      if (discountNum !== undefined) payload.discountPrice = discountNum;
    }

    await onSubmit(payload);
  };

  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Image area */}
        <div className='p-8'>
          <div className='aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative'>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name || 'product'}
                className='w-full h-full object-cover rounded-lg'
              />
            ) : (
              <div className='text-gray-400 text-8xl'>📷</div>
            )}
            {imageActions && (
              <div className='absolute bottom-3 right-3 flex gap-2'>
                {imageActions}
              </div>
            )}
          </div>
        </div>

        {/* Form area */}
        <div className='p-8'>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Название{mode === 'create' ? '*' : ''}
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  emitChange({ name: e.target.value });
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  emitChange({ description: e.target.value });
                }}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Цена, ₽{mode === 'create' ? '*' : ''}
                </label>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    emitChange({ price: e.target.value });
                  }}
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
                  onChange={(e) => {
                    setDiscountPrice(e.target.value);
                    emitChange({ discountPrice: e.target.value });
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Артикул (SKU){mode === 'create' ? '*' : ''}
              </label>
              <input
                type='text'
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  emitChange({ sku: e.target.value });
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {formError && <div className='text-red-600'>{formError}</div>}

            <div className='pt-2 flex items-center gap-3'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Сохранение…' : submitLabel ?? 'Сохранить'}
              </button>
              {onCancel && (
                <button
                  type='button'
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className='px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                >
                  {cancelLabel ?? 'Отмена'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
