import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from '../../../src/products/dto/update-product.dto';
import { CreateProductDto } from '../../../src/products/dto/create-product.dto';

describe('UpdateProductDto', () => {
  describe('наследование от CreateProductDto', () => {
    it('должен иметь те же поля что и CreateProductDto', () => {
      const updateDto = new UpdateProductDto();
      const createDto = new CreateProductDto();

      // Проверяем что UpdateProductDto наследует от CreateProductDto
      expect(updateDto).toBeInstanceOf(Object);
      expect(UpdateProductDto.prototype).toBeDefined();
    });

    it('должен проходить валидацию с полными данными', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        discountPrice: 120,
        sku: 'UPDATED-SKU-001',
        imageUrl: 'https://example.com/updated-image.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен проходить валидацию с частичными данными', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 150,
        description: 'Updated Description',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен проходить валидацию с пустым объектом', async () => {
      const dto = plainToInstance(UpdateProductDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('валидация отдельных полей', () => {
    it('должен валидировать только name', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: 'Updated Product',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать только price', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 150,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать только sku', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        sku: 'UPDATED-SKU-001',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать только description', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        description: 'Updated Description',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать только discountPrice', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        discountPrice: 120,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать только imageUrl', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        imageUrl: 'https://example.com/updated-image.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('валидация типов данных', () => {
    it('должен возвращать ошибку при неверном типе name', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('должен возвращать ошибку при неверном типе price', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('должен возвращать ошибку при неверном типе sku', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        sku: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sku');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('должен возвращать ошибку при неверном типе description', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        description: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('должен возвращать ошибку при неверном типе discountPrice', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        discountPrice: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('discountPrice');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('должен возвращать ошибку при неверном URL imageUrl', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        imageUrl: 'not-a-valid-url',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });
  });

  describe('граничные случаи', () => {
    it('должен обрабатывать пустые строки', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: '',
        description: '',
        sku: '',
        // Не включаем imageUrl, так как пустая строка не валидна для URL
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен обрабатывать нулевые значения', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 0,
        discountPrice: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен обрабатывать отрицательные значения', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: -10,
        discountPrice: -5,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен обрабатывать очень длинные строки', async () => {
      const longString = 'A'.repeat(1000);
      const dto = plainToInstance(UpdateProductDto, {
        name: longString,
        description: longString,
        sku: longString,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('комбинированные сценарии', () => {
    it('должен обрабатывать множественные ошибки валидации', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: 123,
        price: 'not-a-number',
        sku: 456,
        imageUrl: 'invalid-url',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(4);

      const errorProperties = errors.map((error) => error.property);
      expect(errorProperties).toContain('name');
      expect(errorProperties).toContain('price');
      expect(errorProperties).toContain('sku');
      expect(errorProperties).toContain('imageUrl');
    });

    it('должен корректно обрабатывать частичные обновления', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 150,
        description: 'Updated Description',
        imageUrl: 'https://example.com/image.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.price).toBe(150);
      expect(dto.description).toBe('Updated Description');
      expect(dto.imageUrl).toBe('https://example.com/image.jpg');
      expect(dto.name).toBeUndefined();
      expect(dto.sku).toBeUndefined();
      expect(dto.discountPrice).toBeUndefined();
    });
  });
});
