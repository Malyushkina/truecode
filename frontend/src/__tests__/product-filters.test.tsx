import { render, screen, fireEvent } from '@testing-library/react';
import ProductFilters from '@/components/ProductFilters';
import type { QueryProductsDto } from '@/types/product';

describe('ProductFilters', () => {
  const setup = (filters: QueryProductsDto = {}) => {
    const onFiltersChange = jest.fn();
    const result = render(
      <ProductFilters filters={filters} onFiltersChange={onFiltersChange} />
    );
    const rerenderWith = (next: QueryProductsDto) =>
      result.rerender(
        <ProductFilters filters={next} onFiltersChange={onFiltersChange} />
      );
    return { onFiltersChange, rerenderWith };
  };

  it('рендерит поле поиска и меняет значение', () => {
    const { onFiltersChange, rerenderWith } = setup({});
    const input = screen.getByPlaceholderText(
      'Поиск товаров...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'чехол' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'чехол' });

    // обновляем контролируемое значение и очищаем строку поиска → undefined
    rerenderWith({ search: 'чехол' });
    fireEvent.change(input, { target: { value: '' } });
    expect(onFiltersChange).toHaveBeenLastCalledWith({ search: undefined });
  });

  it('переключает поле сортировки и порядок', () => {
    const { onFiltersChange } = setup({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    // смена sortBy
    fireEvent.change(screen.getByDisplayValue('По дате').closest('select')!, {
      target: { value: 'price' },
    });
    expect(onFiltersChange).toHaveBeenCalledWith({ sortBy: 'price' });

    // переключение стрелки sortOrder
    fireEvent.click(screen.getByText('↓'));
    expect(onFiltersChange).toHaveBeenCalledWith({ sortOrder: 'asc' });
  });

  it('раскрывает/скрывает дополнительные фильтры и меняет диапазон цен', () => {
    const { onFiltersChange } = setup({});

    fireEvent.click(screen.getByText('Фильтры'));
    const min = screen.getByPlaceholderText('От') as HTMLInputElement;
    const max = screen.getByPlaceholderText('До') as HTMLInputElement;

    fireEvent.change(min, { target: { value: '100' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ minPrice: 100 });

    fireEvent.change(max, { target: { value: '500' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ maxPrice: 500 });
  });

  it('меняет лимит на странице и поддерживает "Все" (0 => 1000)', () => {
    const { onFiltersChange } = setup({ limit: 12 });

    const limitSelect = screen
      .getByText('На странице:')
      .closest('div')!
      .querySelector('select')!;

    fireEvent.change(limitSelect, { target: { value: '24' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ limit: 24 });

    fireEvent.change(limitSelect, { target: { value: '0' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ limit: 1000 });
  });

  it('кнопка «Очистить» сбрасывает активные фильтры', () => {
    const filters: QueryProductsDto = { search: 'abc', minPrice: 1 };
    const { onFiltersChange } = setup(filters);

    fireEvent.click(screen.getByText('Очистить'));
    expect(onFiltersChange).toHaveBeenCalledWith({
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minPrice: undefined,
      maxPrice: undefined,
    });
  });
});
