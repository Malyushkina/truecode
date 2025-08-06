import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from '../../../src/products/dto/create-product.dto';

describe('CreateProductDto', () => {
  describe('валидация обязательных полей', () => {
    it('должен проходить валидацию с корректными данными', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен возвращать ошибку при отсутствии name', async () => {
      const dto = new CreateProductDto();
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('должен возвращать ошибку при отсутствии price', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('должен возвращать ошибку при отсутствии sku', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sku');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('должен возвращать ошибку при неверном типе price', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      (dto as any).price = 'not-a-number';
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });
  });

  describe('валидация необязательных полей', () => {
    it('должен проходить валидацию с необязательными полями', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';
      dto.description = 'Test Description';
      dto.discountPrice = 80;
      dto.imageUrl = 'https://example.com/image.jpg';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен возвращать ошибку при неверном URL изображения', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';
      dto.imageUrl = 'not-a-valid-url';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('должен возвращать ошибку при неверном типе discountPrice', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';
      (dto as any).discountPrice = 'not-a-number';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('discountPrice');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('должен возвращать ошибку при неверном типе description', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';
      (dto as any).description = 123;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('граничные случаи', () => {
    it('должен проходить валидацию с пустой строкой в name', async () => {
      const dto = new CreateProductDto();
      dto.name = '';
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0); // Пустая строка считается валидной для @IsString
    });

    it('должен проходить валидацию с нулевой ценой', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = 0;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('должен проходить валидацию с отрицательной ценой', async () => {
      const dto = new CreateProductDto();
      dto.name = 'Test Product';
      dto.price = -10;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0); // @IsNumber не проверяет диапазон
    });

    it('должен проходить валидацию с очень длинным названием', async () => {
      const dto = new CreateProductDto();
      dto.name = 'A'.repeat(1000);
      dto.price = 100;
      dto.sku = 'TEST-SKU-001';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
