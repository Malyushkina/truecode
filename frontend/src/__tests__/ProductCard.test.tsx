import { screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/product';
import { renderWithQueryClient } from '@/test-utils';

// Мокаем хуки и компоненты
jest.mock('../hooks/use-product-image', () => ({
  useProductImage: () => ({
    upload: jest.fn(),
    removeImage: jest.fn(),
    isUploading: false,
    error: null,
  }),
}));

jest.mock('../components/ProductImageControls', () => {
  return function MockProductImageControls() {
    return <div data-testid='product-image-controls'>Image Controls</div>;
  };
});

const mockProduct: Product = {
  id: 1,
  uid: 'test-uid-123',
  name: 'Тестовый товар',
  description: 'Описание тестового товара',
  price: 1000,
  sku: 'TEST-001',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockProductWithDiscount: Product = {
  ...mockProduct,
  discountPrice: 800,
};

describe('ProductCard', () => {
  it('должен отрендерить название товара', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Тестовый товар')).toBeInTheDocument();
  });

  it('должен отрендерить описание товара', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Описание тестового товара')).toBeInTheDocument();
  });

  it('должен отрендерить артикул', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Артикул: TEST-001')).toBeInTheDocument();
  });

  it('должен отрендерить обычную цену без скидки', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByText('1 000 ₽')).toBeInTheDocument();
  });

  it('должен отрендерить цену со скидкой и зачеркнутую старую цену', () => {
    renderWithQueryClient(<ProductCard product={mockProductWithDiscount} />);

    expect(screen.getByText('800 ₽')).toBeInTheDocument();
    expect(screen.getByText('1 000 ₽')).toHaveClass('line-through');
  });

  it('должен отрендерить изображение товара', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Тестовый товар');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('должен отрендерить заглушку для изображения, если imageUrl отсутствует', () => {
    const productWithoutImage = { ...mockProduct, imageUrl: undefined };
    renderWithQueryClient(<ProductCard product={productWithoutImage} />);

    expect(screen.getByText('📷')).toBeInTheDocument();
  });

  it('должен отрендерить кнопку "Просмотр"', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Просмотр')).toBeInTheDocument();
  });

  it('должен вызвать onEdit при клике на кнопку "Изменить"', () => {
    const mockOnEdit = jest.fn();
    renderWithQueryClient(
      <ProductCard product={mockProduct} onEdit={mockOnEdit} />
    );

    const editButton = screen.getByText('Изменить');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });

  it('должен вызвать onDelete при клике на кнопку "Удалить"', () => {
    const mockOnDelete = jest.fn();
    renderWithQueryClient(
      <ProductCard product={mockProduct} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
  });

  it('не должен отрендерить кнопки редактирования и удаления, если колбэки не переданы', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.queryByText('Изменить')).not.toBeInTheDocument();
    expect(screen.queryByText('Удалить')).not.toBeInTheDocument();
  });

  it('должен отрендерить ProductImageControls', () => {
    renderWithQueryClient(<ProductCard product={mockProduct} />);

    expect(screen.getByTestId('product-image-controls')).toBeInTheDocument();
  });
});
