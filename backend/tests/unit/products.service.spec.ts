import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/products.repository';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import { QueryProductsDto } from '../../src/products/dto/query-products.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
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

  describe('create', () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto);

      expect(repository.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findAll', () => {
    it('должен возвращать список товаров с пагинацией', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
      };

      const mockResult = {
        products: [
          {
            id: 'test-id',
            name: 'Test Product',
            price: 100,
            sku: 'TEST-SKU-001',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      mockRepository.findMany.mockResolvedValue(mockResult);

      const result = await service.findAll(query);

      expect(repository.findMany).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        products: mockResult.products,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('должен возвращать товар по ID', async () => {
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

      const result = await service.findOne(productId);

      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(expectedProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден', async () => {
      const productId = 'non-existent-id';

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('должен обновлять существующий товар', async () => {
      const productId = 'test-id';
      const updateProductDto: UpdateProductDto = {
        price: 150,
      };

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
        price: 150,
      };

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден при обновлении', async () => {
      const productId = 'non-existent-id';
      const updateProductDto: UpdateProductDto = {
        price: 150,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('remove', () => {
    it('должен удалять существующий товар', async () => {
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

      const result = await service.remove(productId);

      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.delete).toHaveBeenCalledWith(productId);
      expect(result).toEqual(existingProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден при удалении', async () => {
      const productId = 'non-existent-id';

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(productId);
    });
  });
});
