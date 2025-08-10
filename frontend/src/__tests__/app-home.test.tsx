import { screen } from '@testing-library/react';
import { renderWithQueryClient } from '@/test-utils';

jest.mock('@/lib/api', () => {
  return {
    __esModule: true,
    productsApi: {
      getProducts: jest.fn(async () => ({
        products: [
          {
            id: 1,
            uid: 'uid-1',
            name: 'Товар A',
            description: 'Описание',
            price: 1000,
            discountPrice: null,
            sku: 'SKU-1',
            imageUrl: null,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-02T00:00:00.000Z',
          },
        ],
        pagination: { page: 1, limit: 12, total: 1, pages: 1 },
      })),
    },
  };
});

import HomePage from '@/app/page';

describe('App HomePage (catalog)', () => {
  it('рендерит заголовок, счётчик и ссылку создания', async () => {
    renderWithQueryClient(<HomePage />);

    expect(await screen.findByText('Каталог товаров')).toBeInTheDocument();
    expect(screen.getByText(/Найдено товаров:\s*1/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Создать товар' })
    ).toBeInTheDocument();
  });
});
