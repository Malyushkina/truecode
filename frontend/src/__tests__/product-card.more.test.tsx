import { screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types/product';
import { renderWithQueryClient } from '@/test-utils';

const makeProduct = (p: Partial<Product> = {}): Product => ({
  id: p.id ?? 1,
  uid: p.uid ?? 'uid-1',
  name: p.name ?? 'Карточка',
  description: p.description ?? 'Описание',
  price: p.price ?? 2000,
  discountPrice: p.discountPrice,
  sku: p.sku ?? 'SKU-1',
  imageUrl: p.imageUrl,
  createdAt: p.createdAt ?? '',
  updatedAt: p.updatedAt ?? '',
});

describe('ProductCard more', () => {
  it('рендерит основные поля и ссылку на просмотр', () => {
    const product = makeProduct({ uid: 'abc', name: 'Товар A', price: 1200 });
    renderWithQueryClient(<ProductCard product={product} />);

    expect(screen.getByText('Товар A')).toBeInTheDocument();
    expect(screen.getByText(/Артикул:/)).toBeInTheDocument();

    const viewLink = screen.getByText('Просмотр').closest('a');
    expect(viewLink).toHaveAttribute('href', '/products/abc');
  });

  it('отображает цену без скидки', () => {
    const product = makeProduct({ price: 1800 });
    renderWithQueryClient(<ProductCard product={product} />);

    expect(screen.getAllByText(/1\s?800/).length).toBeGreaterThan(0);
  });

  it('отображает цену со скидкой и зачеркнутую полную цену', () => {
    const product = makeProduct({ price: 2000, discountPrice: 1500 });
    renderWithQueryClient(<ProductCard product={product} />);

    expect(screen.getAllByText(/1\s?500/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\s?000/).length).toBeGreaterThan(0);
  });

  it('вызывает onEdit и onDelete при кликах на кнопки', () => {
    const product = makeProduct();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    renderWithQueryClient(
      <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
    );

    fireEvent.click(screen.getByText('Изменить'));
    expect(onEdit).toHaveBeenCalledWith(product);

    fireEvent.click(screen.getByText('Удалить'));
    expect(onDelete).toHaveBeenCalledWith(product);
  });
});
