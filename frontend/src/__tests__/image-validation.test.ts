import { validateImageFile } from '@/lib/image-validation';

describe('validateImageFile', () => {
  it('возвращает ok: true для допустимых типов', () => {
    const types = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    for (const type of types) {
      const file = new File(['x'], `test.${type.split('/')[1]}`, { type });
      const result = validateImageFile(file);
      expect(result).toEqual({ ok: true });
    }
  });

  it('возвращает ошибку для недопустимого типа', () => {
    const file = new File(['x'], 'test.txt', { type: 'text/plain' });
    const result = validateImageFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Неверный тип файла');
    }
  });

  it('возвращает ошибку для пустого файла (0 байт)', () => {
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Файл пустой');
    }
  });

  it('возвращает ошибку для слишком большого файла (>10 МБ)', () => {
    const bigChunk = new Uint8Array(10 * 1024 * 1024 + 1); // 10MB + 1 byte
    const file = new File([bigChunk], 'big.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Файл слишком большой');
    }
  });
});
