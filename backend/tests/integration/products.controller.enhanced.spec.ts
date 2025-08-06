import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/products.repository';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';

describe('ProductsController (Enhanced Integration)', () => {
  let app: INestApplication;
  let service: ProductsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockService,
        },
        {
          provide: ProductsRepository,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Настройка ValidationPipe с детальными ошибками
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    service = moduleFixture.get<ProductsService>(ProductsService);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products - Создание товара', () => {
    it('должен создавать товар с корректными данными', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        sku: 'TEST-SKU-001',
        imageUrl: 'https://example.com/image.jpg',
      };

      const expectedProduct = {
        id: 'test-id',
        ...createProductDto,
        createdAt: expect.anything() as unknown,
        updatedAt: expect.anything() as unknown,
      };

      mockService.create.mockResolvedValue(expectedProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        sku: 'TEST-SKU-001',
        imageUrl: 'https://example.com/image.jpg',
      });
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it('должен возвращать 400 при отсутствии обязательных полей', async () => {
      // Отсутствует name
      await request(app.getHttpServer())
        .post('/products')
        .send({
          price: 100,
          sku: 'TEST-SKU',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('name')),
          ).toBe(true);
        });

      // Отсутствует price
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          sku: 'TEST-SKU',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('price')),
          ).toBe(true);
        });

      // Отсутствует sku
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('sku')),
          ).toBe(true);
        });
    });

    it('должен возвращать 400 при неверных типах данных', async () => {
      // Неверный тип price
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 'not-a-number',
          sku: 'TEST-SKU',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('price')),
          ).toBe(true);
        });

      // Неверный тип name
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 123,
          price: 100,
          sku: 'TEST-SKU',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('name')),
          ).toBe(true);
        });
    });

    it('должен возвращать 400 при неверном URL изображения', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
          sku: 'TEST-SKU',
          imageUrl: 'not-a-valid-url',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('imageUrl')),
          ).toBe(true);
        });
    });

    it('должен возвращать 400 при лишних полях', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
          sku: 'TEST-SKU',
          extraField: 'should not be allowed',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('extraField')),
          ).toBe(true);
        });
    });
  });

  describe('GET /products - Получение списка товаров', () => {
    it('должен возвращать список товаров с пагинацией', async () => {
      const mockProducts = [
        {
          id: 'test-id-1',
          name: 'Product 1',
          price: 100,
          sku: 'SKU-001',
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        },
        {
          id: 'test-id-2',
          name: 'Product 2',
          price: 200,
          sku: 'SKU-002',
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        },
      ];

      const mockResponse = {
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toMatchObject({
        products: [
          {
            id: 'test-id-1',
            name: 'Product 1',
            price: 100,
            sku: 'SKU-001',
          },
          {
            id: 'test-id-2',
            name: 'Product 2',
            price: 200,
            sku: 'SKU-002',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('должен обрабатывать параметры запроса с трансформацией', async () => {
      const queryParams = {
        page: '2',
        limit: '5',
        search: 'test',
        sortBy: 'price',
        sortOrder: 'asc',
        minPrice: '100.5',
        maxPrice: '500.75',
      };

      mockService.findAll.mockResolvedValue({
        products: [],
        pagination: { page: 2, limit: 5, total: 0, pages: 0 },
      });

      await request(app.getHttpServer())
        .get('/products')
        .query(queryParams)
        .expect(200);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'test',
        sortBy: 'price',
        sortOrder: 'asc',
        minPrice: 100.5,
        maxPrice: 500.75,
      });
    });

    it('должен обрабатывать некорректные параметры запроса', async () => {
      const queryParams = {
        page: 'invalid',
        limit: 'not-a-number',
        sortOrder: 'invalid',
      };

      mockService.findAll.mockResolvedValue({
        products: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      });

      await request(app.getHttpServer())
        .get('/products')
        .query(queryParams)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('sortOrder')),
          ).toBe(true);
        });
    });
  });

  describe('GET /products/:id - Получение товара по ID', () => {
    it('должен возвращать товар по ID', async () => {
      const productId = 'test-id';
      const expectedProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      mockService.findOne.mockResolvedValue(expectedProduct);

      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-id',
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
      });
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });

    it('должен возвращать 404 для несуществующего товара', async () => {
      const productId = 'non-existent-id';

      mockService.findOne.mockRejectedValue(
        new NotFoundException(`Товар с ID ${productId} не найден`),
      );

      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('не найден');
        });
    });

    it('должен возвращать 500 при других ошибках', async () => {
      const productId = 'test-id';

      mockService.findOne.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(500);
    });
  });

  describe('PATCH /products/:id - Обновление товара', () => {
    it('должен обновлять товар с корректными данными', async () => {
      const productId = 'test-id';
      const updateProductDto: UpdateProductDto = {
        price: 150,
        description: 'Updated description',
      };

      const updatedProduct = {
        id: productId,
        name: 'Test Product',
        price: 150,
        description: 'Updated description',
        sku: 'TEST-SKU-001',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      mockService.update.mockResolvedValue(updatedProduct);

      const response = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send(updateProductDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-id',
        name: 'Test Product',
        price: 150,
        description: 'Updated description',
        sku: 'TEST-SKU-001',
      });
      expect(service.update).toHaveBeenCalledWith(productId, updateProductDto);
    });

    it('должен возвращать 400 при неверных данных обновления', async () => {
      const productId = 'test-id';

      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({
          price: 'not-a-number',
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) => msg.includes('price')),
          ).toBe(true);
        });
    });

    it('должен возвращать 404 при обновлении несуществующего товара', async () => {
      const productId = 'non-existent-id';
      const updateProductDto = { price: 150 };

      mockService.update.mockRejectedValue(
        new NotFoundException(`Товар с ID ${productId} не найден`),
      );

      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send(updateProductDto)
        .expect(404);
    });
  });

  describe('DELETE /products/:id - Удаление товара', () => {
    it('должен удалять существующий товар', async () => {
      const productId = 'test-id';
      const deletedProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      mockService.remove.mockResolvedValue(deletedProduct);

      const response = await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-id',
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
      });
      expect(service.remove).toHaveBeenCalledWith(productId);
    });

    it('должен возвращать 404 при удалении несуществующего товара', async () => {
      const productId = 'non-existent-id';

      mockService.remove.mockRejectedValue(
        new NotFoundException(`Товар с ID ${productId} не найден`),
      );

      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(404);
    });
  });

  describe('Граничные случаи и обработка ошибок', () => {
    it('должен обрабатывать очень длинные ID', async () => {
      const longId = 'A'.repeat(1000);

      mockService.findOne.mockRejectedValue(
        new NotFoundException(`Товар с ID ${longId} не найден`),
      );

      await request(app.getHttpServer()).get(`/products/${longId}`).expect(404);
    });

    it('должен обрабатывать специальные символы в ID', async () => {
      const specialId = 'test-id-with-special-chars-!@#$%^&*()';

      mockService.findOne.mockRejectedValue(
        new NotFoundException(`Товар с ID ${specialId} не найден`),
      );

      await request(app.getHttpServer())
        .get(`/products/${specialId}`)
        .expect(404);
    });

    it('должен обрабатывать пустые тела запросов', async () => {
      await request(app.getHttpServer()).post('/products').send({}).expect(400);

      // Настраиваем мок для PATCH запроса с пустым объектом
      const existingProduct = {
        id: 'test-id',
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.findOne.mockResolvedValue(existingProduct);
      mockService.update.mockResolvedValue(existingProduct);

      await request(app.getHttpServer())
        .patch('/products/test-id')
        .send({})
        .expect(200); // Пустой объект валиден для PATCH
    });
  });
});
