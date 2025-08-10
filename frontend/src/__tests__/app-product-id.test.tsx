import { screen, fireEvent } from '@testing-library/react';
import { renderWithQueryClient } from '@/test-utils';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'uid-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

// Мок позволит по месту переопределять реализацию
const getProductMock = jest.fn();
jest.mock('@/lib/api', () => {
  return {
    __esModule: true,
    productsApi: {
      getProduct: (...args: any[]) => getProductMock(...args),
      updateProduct: jest.fn(async () => ({})),
      deleteProduct: jest.fn(async () => ({})),
    },
  };
});

import ProductPage from '@/app/products/[id]/page';

describe('App ProductPage', () => {
  beforeEach(() => {
    getProductMock.mockReset();
  });

  it('рендерит название и позволяет раскрывать описание', async () => {
    getProductMock.mockResolvedValue({
      id: 1,
      uid: 'uid-1',
      name: 'Товар A',
      description: 'Длинное описание'.repeat(20),
      price: 2000,
      discountPrice: 1500,
      sku: 'SKU-1',
      imageUrl: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });

    renderWithQueryClient(<ProductPage />);

    expect(await screen.findByText('Товар A')).toBeInTheDocument();
    const toggle = await screen.findByRole('button', {
      name: /Читать дальше|Свернуть/,
    });
    fireEvent.click(toggle);
    expect(
      await screen.findByRole('button', { name: /Читать дальше|Свернуть/ })
    ).toBeInTheDocument();
  });

  it('показывает кнопки действий', async () => {
    getProductMock.mockResolvedValue({
      id: 1,
      uid: 'uid-1',
      name: 'Товар A',
      description: 'x',
      price: 2000,
      discountPrice: null,
      sku: 'SKU-1',
      imageUrl: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });

    renderWithQueryClient(<ProductPage />);
    expect(
      await screen.findByRole('button', { name: 'Редактировать' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Удалить/ })).toBeInTheDocument();
  });

  it('показывает спиннер при загрузке', async () => {
    // Обещание, которое резолвим позже, чтобы увидеть спиннер
    let resolveFn: (val: any) => void;
    const pending = new Promise((resolve) => {
      resolveFn = resolve as (val: any) => void;
    });
    getProductMock.mockReturnValueOnce(pending);

    renderWithQueryClient(<ProductPage />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();

    // Завершаем промис, чтобы не зависнуть
    resolveFn!({
      id: 1,
      uid: 'uid-1',
      name: 'T',
      price: 1,
      sku: 'S',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });
    expect(await screen.findByText('T')).toBeInTheDocument();
  });

  it('показывает сообщение об ошибке, если товар не найден/ошибка', async () => {
    getProductMock.mockRejectedValueOnce(new Error('fail'));

    renderWithQueryClient(<ProductPage />);
    expect(await screen.findByText('Товар не найден')).toBeInTheDocument();
  });
});
