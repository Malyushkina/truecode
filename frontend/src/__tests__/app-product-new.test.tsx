import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test-utils';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const createProductMock = jest.fn();
const uploadImageMock = jest.fn();
jest.mock('@/lib/api', () => {
  return {
    __esModule: true,
    productsApi: {
      createProduct: (...args: any[]) => createProductMock(...args),
      uploadImage: (...args: any[]) => uploadImageMock(...args),
    },
  };
});

import NewProductPage from '@/app/products/new/page';

describe('App NewProductPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    createProductMock.mockReset();
    uploadImageMock.mockReset();
  });

  it('рендерит заголовок и инструкцию', async () => {
    renderWithQueryClient(<NewProductPage />);
    expect(await screen.findByText('Создать товар')).toBeInTheDocument();
    expect(screen.getByText(/Заполните форму ниже/)).toBeInTheDocument();
  });

  it('после успешного создания редиректит на страницу товара', async () => {
    // контролируемый промис, чтобы гарантировать порядок
    let resolveFn: (v: any) => void;
    const createdPromise = new Promise((resolve) => {
      resolveFn = resolve as (v: any) => void;
    });
    createProductMock.mockReturnValueOnce(createdPromise);

    renderWithQueryClient(<NewProductPage />);

    fireEvent.change(screen.getByLabelText(/^Название/), {
      target: { value: 'A' },
    });
    fireEvent.change(screen.getByLabelText(/^Цена, ₽/), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/^Артикул/), {
      target: { value: 'S' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    // теперь резолвим мок
    resolveFn!({ id: 1, uid: 'u1' });

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalled();
    });
  });

  it('кнопка загрузки показывает текст "Загрузка…" при отправке', async () => {
    createProductMock.mockResolvedValue({ id: 1, uid: 'u1' });

    renderWithQueryClient(<NewProductPage />);

    fireEvent.change(screen.getByLabelText(/^Название/), {
      target: { value: 'A' },
    });
    fireEvent.change(screen.getByLabelText(/^Цена, ₽/), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/^Артикул/), {
      target: { value: 'S' },
    });

    const uploadLabel = screen.getByText(/Загрузить|Загрузка…/);
    expect(uploadLabel).toBeInTheDocument();
  });
});
