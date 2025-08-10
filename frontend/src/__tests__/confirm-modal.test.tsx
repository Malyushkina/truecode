import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '@/components/ConfirmModal';

function setup(props: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const result = render(
    <ConfirmModal
      open={true}
      title='Подтверждение'
      description='Вы уверены?'
      confirmText='ОК'
      cancelText='Отмена'
      isLoading={false}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );
  return { ...result, onConfirm, onCancel };
}

describe('ConfirmModal', () => {
  it('не рендерится, когда open=false', () => {
    render(
      <ConfirmModal open={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('рендерит заголовок и описание, когда open=true', () => {
    setup();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Подтверждение')).toBeInTheDocument();
    expect(screen.getByText('Вы уверены?')).toBeInTheDocument();
  });

  it('вызывает onCancel при клике на оверлей', () => {
    const { onCancel } = setup();
    const overlay = screen.getByText('Подтверждение').parentElement
      ?.previousSibling as HTMLElement;
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });

  it('вызывает onCancel при клике на кнопку Отмена', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByText('Отмена'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('вызывает onConfirm при клике на кнопку ОК', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByText('ОК'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('вызывает onCancel при нажатии Escape', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('кнопки дизейблятся при isLoading=true и отображается спиннер', () => {
    setup({ isLoading: true });
    expect(screen.getByText('Отмена')).toBeDisabled();
    const confirmBtn = screen.getByText('ОК');
    expect(confirmBtn).toBeDisabled();
    // Спиннер рендерится
    expect(confirmBtn.querySelector('span')).toBeInTheDocument();
  });
});
