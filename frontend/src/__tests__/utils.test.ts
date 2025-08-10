import {
  formatPrice,
  formatDate,
  truncateText,
  generateId,
} from '../lib/utils';

describe('Utils', () => {
  describe('formatPrice', () => {
    it('должен форматировать целую цену в рубли', () => {
      const result = formatPrice(1000);
      expect(result).toMatch(/1\s*000\s*₽/);
    });

    it('должен форматировать цену с копейками', () => {
      const result = formatPrice(1000.5);
      expect(result).toMatch(/1\s*000,5\s*₽/);
    });

    it('должен форматировать нулевую цену', () => {
      const result = formatPrice(0);
      expect(result).toMatch(/0\s*₽/);
    });

    it('должен форматировать большую цену', () => {
      const result = formatPrice(999999);
      expect(result).toMatch(/999\s*999\s*₽/);
    });
  });

  describe('formatDate', () => {
    it('должен форматировать дату в русском формате', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDate(dateString);

      // Проверяем, что результат содержит ожидаемые части
      expect(result).toMatch(/\d{1,2}/); // день
      expect(result).toMatch(/января/i);
      expect(result).toMatch(/2024/); // год
      expect(result).toMatch(/\d{2}:\d{2}/); // время
    });

    it('должен обрабатывать разные форматы дат', () => {
      const dateString = '2024-12-31T23:59:59';
      const result = formatDate(dateString);

      expect(result).toContain('31');
      expect(result).toContain('декабря');
      expect(result).toContain('2024');
    });
  });

  describe('truncateText', () => {
    it('должен возвращать исходный текст, если он короче максимальной длины', () => {
      expect(truncateText('Короткий текст', 20)).toBe('Короткий текст');
    });

    it('должен обрезать текст и добавлять многоточие', () => {
      expect(truncateText('Очень длинный текст для обрезки', 15)).toBe(
        'Очень длинный т...'
      );
    });

    it('должен обрезать текст точно по границе слова', () => {
      expect(truncateText('Текст для обрезки', 10)).toBe('Текст для ...');
    });

    it('должен обрабатывать пустую строку', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('generateId', () => {
    it('должен генерировать строку', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('должен генерировать ID длиной 9 символов', () => {
      const id = generateId();
      expect(id.length).toBe(9);
    });

    it('должен генерировать разные ID при каждом вызове', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('должен генерировать ID только из букв и цифр', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
});
