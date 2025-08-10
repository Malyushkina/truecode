import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/Pagination';

describe('Pagination', () => {
  const setup = (props?: Partial<React.ComponentProps<typeof Pagination>>) => {
    const onPageChange = jest.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={onPageChange}
        {...props}
      />
    );
    return { onPageChange };
  };

  it('дизейблит кнопку Назад на первой странице и Вперед на последней', () => {
    // первая страница
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
    );
    expect(screen.getByText('Назад')).toBeDisabled();
    expect(screen.getByText('Вперед')).not.toBeDisabled();

    // последняя страница
    rerender(
      <Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />
    );
    expect(screen.getByText('Назад')).not.toBeDisabled();
    expect(screen.getByText('Вперед')).toBeDisabled();
  });

  it('вызывает onPageChange при клике Назад/Вперед', () => {
    const { onPageChange } = setup({ currentPage: 3, totalPages: 5 });
    fireEvent.click(screen.getByText('Назад'));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('Вперед'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('вызывает onPageChange при клике по номеру страницы', () => {
    const { onPageChange } = setup({ currentPage: 3, totalPages: 10 });

    // кнопки номеров страниц отображаются, выберем, например, 5
    fireEvent.click(screen.getByText('5'));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('подсвечивает текущую страницу', () => {
    setup({ currentPage: 4, totalPages: 10 });
    const currentBtn = screen.getByText('4');
    // имеет стили активной кнопки
    expect(currentBtn.className).toContain('bg-blue-600');
  });
});
