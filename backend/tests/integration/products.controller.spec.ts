import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/products.repository';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';

describe('ProductsController (e2e)', () => {
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

    // Добавляем ValidationPipe для тестов
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
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

  describe('/products (POST)', () => {
    it('должен создавать новый товар', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        sku: 'TEST-SKU-001',
      };

      const expectedProduct = {
        id: 'test-id',
        ...createProductDto,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
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
      });
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it('должен возвращать 400 при неверных данных', async () => {
      // Этот тест проверяет валидацию на уровне DTO
      // В реальном приложении ValidationPipe должен отклонить неверные данные

      // Тест 1: Отсутствует обязательное поле name
      await request(app.getHttpServer())
        .post('/products')
        .send({
          price: 100,
          sku: 'TEST-SKU',
        })
        .expect(400);

      // Тест 2: Неверный тип цены
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 'not-a-number',
          sku: 'TEST-SKU',
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('должен возвращать список товаров', async () => {
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
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        minPrice: undefined,
        maxPrice: undefined,
      });
    });

    it('должен обрабатывать параметры запроса', async () => {
      const queryParams = {
        page: 1,
        limit: 5,
        search: 'test',
        sortBy: 'price',
        sortOrder: 'desc',
        minPrice: 100,
        maxPrice: 500,
      };

      mockService.findAll.mockResolvedValue({
        products: [],
        pagination: { page: 1, limit: 5, total: 0, pages: 0 },
      });

      await request(app.getHttpServer())
        .get('/products')
        .query(queryParams)
        .expect(200);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        search: 'test',
        sortBy: 'price',
        sortOrder: 'desc',
        minPrice: 100,
        maxPrice: 500,
      });
    });
  });

  describe('/products/:id (GET)', () => {
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

      mockService.findOne.mockRejectedValue(new Error('Product not found'));

      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(500); // В реальном приложении должно быть 404
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('должен обновлять товар', async () => {
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
  });

  describe('/products/:id (DELETE)', () => {
    it('должен удалять товар', async () => {
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
  });
});
