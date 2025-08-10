import { render, screen } from '@testing-library/react';
import ProductList from '@/components/ProductList';
import type { Product } from '@/types/product';

const makeProduct = (p: Partial<Product> = {}): Product => ({
  id: p.id ?? 1,
  uid: p.uid ?? 'uid-1',
  name: p.name ?? 'Товар',
  description: p.description,
  price: p.price ?? 1000,
  discountPrice: p.discountPrice,
  sku: p.sku ?? 'SKU-1',
  imageUrl: p.imageUrl,
  createdAt: p.createdAt ?? '',
  updatedAt: p.updatedAt ?? '',
});

describe('ProductList', () => {
  it('показывает пустое состояние при отсутствии товаров', () => {
    render(<ProductList products={[]} />);
    expect(screen.getByText('Товары не найдены')).toBeInTheDocument();
    expect(
      screen.getByText('Попробуйте изменить параметры поиска')
    ).toBeInTheDocument();
  });

  it('рендерит список товаров', () => {
    const products: Product[] = [
      makeProduct({ id: 1, uid: 'a', name: 'A', price: 1000, sku: 'A1' }),
      makeProduct({ id: 2, uid: 'b', name: 'B', price: 2000, sku: 'B1' }),
    ];
    render(<ProductList products={products} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    // Ссылки ведут на правильные страницы
    const links = screen.getAllByRole('link');
    expect(links.some((a) => a.getAttribute('href') === '/products/a')).toBe(
      true
    );
    expect(links.some((a) => a.getAttribute('href') === '/products/b')).toBe(
      true
    );
  });

  it('отображает цены и скидку корректно', () => {
    const products: Product[] = [
      makeProduct({
        id: 1,
        uid: 'a',
        name: 'A',
        price: 2000,
        discountPrice: 1500,
        sku: 'A1',
      }),
      makeProduct({ id: 2, uid: 'b', name: 'B', price: 1200, sku: 'B1' }),
    ];
    render(<ProductList products={products} />);

    // Для товара со скидкой отображаются обе цены (в мобильной строке)
    expect(screen.getAllByText(/1\s?500/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\s?000/).length).toBeGreaterThan(0);

    // Для товара без скидки отображается только полная цена
    expect(screen.getAllByText(/1\s?200/).length).toBeGreaterThan(0);
  });
});
