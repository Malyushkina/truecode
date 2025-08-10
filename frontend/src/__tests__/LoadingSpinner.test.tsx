import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('должен отрендериться с текстом "Загрузка..."', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('должен содержать элемент с анимацией спиннера', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByText('Загрузка...').previousElementSibling;
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('должен иметь правильную структуру DOM', () => {
    const { container } = render(<LoadingSpinner />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'py-12'
    );
  });
});
