import { render, screen, fireEvent } from '@testing-library/react';
import ProductImageControls from '@/components/ProductImageControls';

describe('ProductImageControls', () => {
  it('рендерит кнопку загрузки и вызывает onUpload при выборе файла', () => {
    const onUpload = jest.fn();
    render((<ProductImageControls onUpload={onUpload} />) as any);

    // Найдем label "Загрузить"
    const uploadLabel = screen.getByText(/Загрузить|Загрузка…/);
    const input = uploadLabel
      .closest('label')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Триггерим выбор файла
    const file = new File(['content'], 'pic.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload.mock.calls[0][0]).toBeInstanceOf(File);
    expect(onUpload.mock.calls[0][0].name).toBe('pic.jpg');
  });

  it('очищает value инпута после выбора файла', () => {
    const onUpload = jest.fn();
    render((<ProductImageControls onUpload={onUpload} />) as any);

    const uploadLabel = screen.getByText(/Загрузить|Загрузка…/);
    const input = uploadLabel
      .closest('label')
      ?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['content'], 'pic.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(input.value).toBe('');
  });

  it('рендерит кнопку удаления, когда есть imageUrl и onDelete, и вызывает onDelete по клику', () => {
    const onDelete = jest.fn();
    render(
      (
        <ProductImageControls
          imageUrl='http://x/img.jpg'
          onUpload={jest.fn()}
          onDelete={onDelete}
        />
      ) as any
    );

    const deleteBtn = screen.getByText('Удалить');
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('делает элементы disabled, когда disabled=true или isUploading=true', () => {
    const onUpload = jest.fn();
    const { rerender } = render(
      (
        <ProductImageControls
          imageUrl='x'
          onUpload={onUpload}
          onDelete={jest.fn()}
          disabled
        />
      ) as any
    );

    let uploadLabel = screen
      .getByText(/Загрузить|Загрузка…/)
      .closest('label') as HTMLLabelElement;
    let input = uploadLabel.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toBeDisabled();

    let deleteBtn = screen.getByText('Удалить') as HTMLButtonElement;
    expect(deleteBtn).toBeDisabled();

    // isUploading=true
    rerender(
      (
        <ProductImageControls
          imageUrl='x'
          onUpload={onUpload}
          onDelete={jest.fn()}
          isUploading
        />
      ) as any
    );

    uploadLabel = screen
      .getByText(/Загрузка…/)
      .closest('label') as HTMLLabelElement;
    input = uploadLabel.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();

    deleteBtn = screen.getByText('Удалить') as HTMLButtonElement;
    expect(deleteBtn).toBeDisabled();
  });
});
