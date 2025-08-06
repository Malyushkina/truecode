import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  QueryProductsDto,
  SortOrder,
} from '../../../src/products/dto/query-products.dto';

describe('QueryProductsDto', () => {
  describe('валидация и трансформация параметров', () => {
    it('должен использовать значения по умолчанию при пустых параметрах', async () => {
      const dto = plainToClass(QueryProductsDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.sortBy).toBe('createdAt');
      expect(dto.sortOrder).toBe(SortOrder.DESC);
    });

    it('должен корректно обрабатывать числовые параметры', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '2',
        limit: '5',
        minPrice: '100.5',
        maxPrice: '500.75',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(5);
      expect(dto.minPrice).toBe(100.5);
      expect(dto.maxPrice).toBe(500.75);
    });

    it('должен обрабатывать некорректные числовые значения', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: 'invalid',
        limit: 'not-a-number',
        minPrice: 'abc',
        maxPrice: 'xyz',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0); // Трансформация обрабатывает ошибки
      expect(dto.page).toBe(1); // Значение по умолчанию
      expect(dto.limit).toBe(10); // Значение по умолчанию
      expect(dto.minPrice).toBeUndefined();
      expect(dto.maxPrice).toBeUndefined();
    });

    it('должен корректно обрабатывать строковые параметры', async () => {
      const dto = plainToClass(QueryProductsDto, {
        search: 'test product',
        sortBy: 'price',
        sortOrder: 'asc',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('test product');
      expect(dto.sortBy).toBe('price');
      expect(dto.sortOrder).toBe(SortOrder.ASC);
    });
  });

  describe('валидация enum значений', () => {
    it('должен принимать корректные значения SortOrder', async () => {
      const dto = plainToClass(QueryProductsDto, {
        sortOrder: 'asc',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.sortOrder).toBe(SortOrder.ASC);
    });

    it('должен принимать DESC как значение по умолчанию', async () => {
      const dto = plainToClass(QueryProductsDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.sortOrder).toBe(SortOrder.DESC);
    });

    it('должен возвращать ошибку при неверном значении sortOrder', async () => {
      const dto = plainToClass(QueryProductsDto, {
        sortOrder: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sortOrder');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('граничные случаи', () => {
    it('должен обрабатывать очень большие числа', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '999999',
        limit: '1000',
        minPrice: '999999.99',
        maxPrice: '999999.99',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(999999);
      expect(dto.limit).toBe(1000);
      expect(dto.minPrice).toBe(999999.99);
      expect(dto.maxPrice).toBe(999999.99);
    });

    it('должен обрабатывать отрицательные числа', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '-1',
        limit: '-5',
        minPrice: '-100',
        maxPrice: '-50',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(-1);
      expect(dto.limit).toBe(-5);
      expect(dto.minPrice).toBe(-100);
      expect(dto.maxPrice).toBe(-50);
    });

    it('должен обрабатывать нулевые значения', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '0',
        limit: '0',
        minPrice: '0',
        maxPrice: '0',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(0);
      expect(dto.limit).toBe(0);
      expect(dto.minPrice).toBe(0);
      expect(dto.maxPrice).toBe(0);
    });

    it('должен обрабатывать пустые строки', async () => {
      const dto = plainToClass(QueryProductsDto, {
        search: '',
        sortBy: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('');
      expect(dto.sortBy).toBe('');
    });

    it('должен обрабатывать очень длинные строки', async () => {
      const longString = 'A'.repeat(1000);
      const dto = plainToClass(QueryProductsDto, {
        search: longString,
        sortBy: longString,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.search).toBe(longString);
      expect(dto.sortBy).toBe(longString);
    });
  });

  describe('комбинированные сценарии', () => {
    it('должен корректно обрабатывать полный набор параметров', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '3',
        limit: '25',
        search: 'test product',
        sortBy: 'name',
        sortOrder: 'asc',
        minPrice: '50.5',
        maxPrice: '200.75',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(25);
      expect(dto.search).toBe('test product');
      expect(dto.sortBy).toBe('name');
      expect(dto.sortOrder).toBe(SortOrder.ASC);
      expect(dto.minPrice).toBe(50.5);
      expect(dto.maxPrice).toBe(200.75);
    });

    it('должен обрабатывать частично некорректные данные', async () => {
      const dto = plainToClass(QueryProductsDto, {
        page: '2',
        limit: 'invalid',
        search: 'test',
        sortBy: 'price',
        sortOrder: 'invalid',
        minPrice: '100',
        maxPrice: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1); // Только sortOrder должен вызвать ошибку
      expect(errors[0].property).toBe('sortOrder');
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(10); // Значение по умолчанию
      expect(dto.search).toBe('test');
      expect(dto.sortBy).toBe('price');
      expect(dto.minPrice).toBe(100);
      expect(dto.maxPrice).toBeUndefined();
    });
  });
});
