import Form from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useMemo } from 'react';

type ProductFormData = {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  sku?: string;
};

interface ProductAutoFormProps {
  formData?: ProductFormData;
  disabled?: boolean;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
}

const ThemedForm = withTheme({}) as typeof Form;

export default function ProductAutoForm({
  formData,
  disabled,
  onSubmit,
}: ProductAutoFormProps) {
  const schema = useMemo(
    () => ({
      type: 'object',
      required: ['name', 'price', 'sku'],
      properties: {
        name: { type: 'string', title: 'Название' },
        description: { type: 'string', title: 'Описание' },
        price: { type: 'number', title: 'Цена, ₽', minimum: 0 },
        discountPrice: {
          type: 'number',
          title: 'Цена со скидкой, ₽',
          minimum: 0,
        },
        sku: { type: 'string', title: 'Артикул (SKU)' },
      },
    }),
    []
  );

  const uiSchema = useMemo(
    () => ({
      'ui:order': ['name', 'description', 'price', 'discountPrice', 'sku'],
      description: { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } },
    }),
    []
  );

  return (
    <ThemedForm
      schema={schema as object}
      uiSchema={uiSchema as object}
      formData={formData}
      disabled={disabled}
      validator={validator}
      onSubmit={({ formData }) => onSubmit(formData as ProductFormData)}
      liveValidate={false}
      showErrorList={false}
    >
      {/* Кнопки рендерим снаружи, чтобы соответствовать общему стилю */}
      <></>
    </ThemedForm>
  );
}
