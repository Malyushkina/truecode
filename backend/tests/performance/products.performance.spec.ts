import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/products.repository';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import {
  QueryProductsDto,
  SortOrder,
} from '../../src/products/dto/query-products.dto';

describe('Products Performance Tests', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  const mockRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('производительность создания товаров', () => {
    it('должен создавать товар за приемлемое время', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Performance Test Product',
        description: 'Test Description',
        price: 100,
        sku: 'PERF-TEST-001',
      };

      const expectedProduct = {
        id: 'test-id',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedProduct);

      const startTime = Date.now();
      const result = await service.create(createProductDto);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toEqual(expectedProduct);
      expect(executionTime).toBeLessThan(1000); // Менее 1 секунды
      expect(repository.create).toHaveBeenCalledWith(createProductDto);
    });

    it('должен обрабатывать множественные создания товаров', async () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        name: `Product ${i}`,
        description: `Description ${i}`,
        price: 100 + i,
        sku: `SKU-${i.toString().padStart(3, '0')}`,
      }));

      const startTime = Date.now();

      const promises = products.map((product) => service.create(product));
      const results = await Promise.all(promises);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(executionTime).toBeLessThan(2000); // Менее 2 секунд
      expect(repository.create).toHaveBeenCalledTimes(10);
    });
  });

  describe('производительность поиска товаров', () => {
    it('должен быстро находить товар по ID', async () => {
      const productId = 'test-id';
      const expectedProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(expectedProduct);

      const startTime = Date.now();
      const result = await service.findOne(productId);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toEqual(expectedProduct);
      expect(executionTime).toBeLessThan(500); // Менее 500мс
      expect(repository.findById).toHaveBeenCalledWith(productId);
    });

    it('должен быстро обрабатывать поиск с фильтрацией', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
        search: 'test',
        minPrice: 100,
        maxPrice: 500,
        sortBy: 'price',
        sortOrder: SortOrder.ASC,
      };

      const mockResult = {
        products: Array.from({ length: 10 }, (_, i) => ({
          id: `product-${i}`,
          name: `Product ${i}`,
          price: 100 + i * 10,
          sku: `SKU-${i}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        total: 100,
      };

      mockRepository.findMany.mockResolvedValue(mockResult);

      const startTime = Date.now();
      const result = await service.findAll(query);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.products).toHaveLength(10);
      expect(result.pagination.total).toBe(100);
      expect(executionTime).toBeLessThan(1000); // Менее 1 секунды
      expect(repository.findMany).toHaveBeenCalledWith(query);
    });

    it('должен обрабатывать большие наборы данных', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 100,
      };

      const mockResult = {
        products: Array.from({ length: 100 }, (_, i) => ({
          id: `product-${i}`,
          name: `Product ${i}`,
          price: 100 + i,
          sku: `SKU-${i}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        total: 1000,
      };

      mockRepository.findMany.mockResolvedValue(mockResult);

      const startTime = Date.now();
      const result = await service.findAll(query);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.products).toHaveLength(100);
      expect(result.pagination.total).toBe(1000);
      expect(executionTime).toBeLessThan(2000); // Менее 2 секунд
    });
  });

  describe('производительность обновления товаров', () => {
    it('должен быстро обновлять товар', async () => {
      const productId = 'test-id';
      const updateData = { price: 150, description: 'Updated' };

      const existingProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
      };

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const startTime = Date.now();
      const result = await service.update(productId, updateData);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toEqual(updatedProduct);
      expect(executionTime).toBeLessThan(1000); // Менее 1 секунды
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.update).toHaveBeenCalledWith(productId, updateData);
    });
  });

  describe('производительность удаления товаров', () => {
    it('должен быстро удалять товар', async () => {
      const productId = 'test-id';
      const existingProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockResolvedValue(existingProduct);

      const startTime = Date.now();
      const result = await service.remove(productId);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toEqual(existingProduct);
      expect(executionTime).toBeLessThan(1000); // Менее 1 секунды
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.delete).toHaveBeenCalledWith(productId);
    });
  });

  describe('нагрузочное тестирование', () => {
    it('должен обрабатывать множество одновременных запросов', async () => {
      const productId = 'test-id';
      const expectedProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(expectedProduct);

      const startTime = Date.now();

      // Создаем 50 одновременных запросов
      const promises = Array.from({ length: 50 }, () =>
        service.findOne(productId),
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(50);
      expect(executionTime).toBeLessThan(3000); // Менее 3 секунд
      expect(repository.findById).toHaveBeenCalledTimes(50);
    });

    it('должен обрабатывать множественные операции CRUD', async () => {
      const operations: Promise<any>[] = [];

      // Создание
      for (let i = 0; i < 10; i++) {
        const createDto = {
          name: `Product ${i}`,
          price: 100 + i,
          sku: `SKU-${i}`,
        };
        mockRepository.create.mockResolvedValue({
          id: `id-${i}`,
          ...createDto,
        });
        operations.push(service.create(createDto));
      }

      // Поиск
      for (let i = 0; i < 10; i++) {
        mockRepository.findById.mockResolvedValue({
          id: `id-${i}`,
          name: `Product ${i}`,
        });
        operations.push(service.findOne(`id-${i}`));
      }

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(20);
      expect(executionTime).toBeLessThan(5000); // Менее 5 секунд
    });
  });

  describe('граничные случаи производительности', () => {
    it('должен обрабатывать очень большие запросы', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 1000,
        search: 'A'.repeat(1000), // Очень длинный поисковый запрос
      };

      const mockResult = {
        products: Array.from({ length: 1000 }, (_, i) => ({
          id: `product-${i}`,
          name: 'A'.repeat(1000), // Очень длинное название
          price: 100 + i,
          sku: 'A'.repeat(100), // Очень длинный SKU
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        total: 10000,
      };

      mockRepository.findMany.mockResolvedValue(mockResult);

      const startTime = Date.now();
      const result = await service.findAll(query);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.products).toHaveLength(1000);
      expect(executionTime).toBeLessThan(10000); // Менее 10 секунд
    });

    it('должен обрабатывать пустые результаты быстро', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
        search: 'nonexistent',
      };

      const mockResult = {
        products: [],
        total: 0,
      };

      mockRepository.findMany.mockResolvedValue(mockResult);

      const startTime = Date.now();
      const result = await service.findAll(query);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.products).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(executionTime).toBeLessThan(500); // Менее 500мс
    });
  });
});
