import { render, screen, fireEvent } from '@testing-library/react';
import ProductForm from '@/components/ProductForm';

describe('ProductForm', () => {
  it('рендерит форму и показывает валидацию в режиме create', () => {
    const onSubmit = jest.fn();
    render(<ProductForm mode='create' onSubmit={onSubmit} />);

    // Сабмит без обязательных полей
    fireEvent.click(screen.getByText('Сохранить'));
    expect(screen.getByText('Введите название товара')).toBeInTheDocument();

    // Заполнить имя, оставить цену пустой
    const nameInput1 = (
      screen.getByText('Название*').parentElement as HTMLElement
    ).querySelector('input') as HTMLInputElement;
    fireEvent.change(nameInput1, { target: { value: 'Товар' } });
    fireEvent.click(screen.getByText('Сохранить'));
    expect(screen.getByText('Введите артикул (SKU)')).toBeInTheDocument();

    const skuInput1 = (
      screen.getByText('Артикул (SKU)*').parentElement as HTMLElement
    ).querySelector('input') as HTMLInputElement;
    fireEvent.change(skuInput1, { target: { value: 'SKU1' } });
    fireEvent.click(screen.getByText('Сохранить'));
    expect(
      screen.getByText('Цена должна быть положительным числом')
    ).toBeInTheDocument();
  });

  it('успешный submit в режиме create', () => {
    const onSubmit = jest.fn();
    render(<ProductForm mode='create' onSubmit={onSubmit} />);

    // Ввод корректных значений
    const nameInput = (
      screen.getByText('Название*').parentElement as HTMLElement
    ).querySelector('input') as HTMLInputElement;
    const priceInput = (
      screen.getByText('Цена, ₽*').parentElement as HTMLElement
    ).querySelector('input') as HTMLInputElement;
    const skuInput = (
      screen.getByText('Артикул (SKU)*').parentElement as HTMLElement
    ).querySelector('input') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Товар' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.change(skuInput, { target: { value: 'SKU1' } });

    fireEvent.click(screen.getByText('Сохранить'));

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Товар',
      price: 100,
      sku: 'SKU1',
    });
  });

  it('режим edit: допускает пустые обязательные поля и валидирует только числа при наличии', async () => {
    const onSubmit = jest.fn();
    render(
      <ProductForm
        mode='edit'
        onSubmit={onSubmit}
        initialValues={{ name: 'A', sku: 'S' }}
      />
    );

    // Очистим цену и скидку, сабмит допускается (необязательные)
    fireEvent.click(screen.getByText('Сохранить'));
    expect(onSubmit).toHaveBeenCalled();

    // Невалидная скидка
    const discountInput = screen
      .getByText('Цена со скидкой, ₽')
      .parentElement!.querySelector('input') as HTMLInputElement;
    fireEvent.change(discountInput, { target: { value: '-5' } });
    onSubmit.mockClear();
    fireEvent.click(screen.getByText('Сохранить'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('кнопка Отмена вызывает onCancel и disabled при isSubmitting', () => {
    const onCancel = jest.fn();
    const { rerender } = render(
      <ProductForm mode='create' onSubmit={jest.fn()} onCancel={onCancel} />
    );

    fireEvent.click(screen.getByText('Отмена'));
    expect(onCancel).toHaveBeenCalled();

    rerender(
      <ProductForm
        mode='create'
        onSubmit={jest.fn()}
        onCancel={onCancel}
        isSubmitting
      />
    );
    expect((screen.getByText('Отмена') as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(
      (screen.getByText('Сохранение…') as HTMLButtonElement).disabled
    ).toBe(true);
  });
});
