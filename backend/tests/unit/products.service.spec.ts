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
    findByUid: jest.fn(),
    updateByUid: jest.fn(),
    deleteByUid: jest.fn(),
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
        id: 1,
        uid: 'test-uid',
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
            id: 1,
            uid: 'test-uid',
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
    it('должен возвращать товар по UID', async () => {
      const productUid = 'test-uid';
      const expectedProduct = {
        id: 1,
        uid: productUid,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUid.mockResolvedValue(expectedProduct);

      const result = await service.findOne(productUid);

      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
      expect(result).toEqual(expectedProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден', async () => {
      const productUid = 'non-existent-uid';

      mockRepository.findByUid.mockResolvedValue(null);

      await expect(service.findOne(productUid)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
    });
  });

  describe('update', () => {
    it('должен обновлять существующий товар', async () => {
      const productUid = 'test-uid';
      const updateProductDto: UpdateProductDto = {
        price: 150,
      };

      const existingProduct = {
        id: 1,
        uid: productUid,
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

      mockRepository.findByUid.mockResolvedValue(existingProduct);
      mockRepository.updateByUid.mockResolvedValue(updatedProduct);

      const result = await service.update(productUid, updateProductDto);

      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
      expect(repository.updateByUid).toHaveBeenCalledWith(
        productUid,
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден при обновлении', async () => {
      const productUid = 'non-existent-uid';
      const updateProductDto: UpdateProductDto = {
        price: 150,
      };

      mockRepository.findByUid.mockResolvedValue(null);

      await expect(
        service.update(productUid, updateProductDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
    });
  });

  describe('remove', () => {
    it('должен удалять существующий товар', async () => {
      const productUid = 'test-uid';
      const existingProduct = {
        id: 1,
        uid: productUid,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUid.mockResolvedValue(existingProduct);
      mockRepository.deleteByUid.mockResolvedValue(existingProduct);

      const result = await service.remove(productUid);

      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
      expect(repository.deleteByUid).toHaveBeenCalledWith(productUid);
      expect(result).toEqual(existingProduct);
    });

    it('должен выбрасывать NotFoundException если товар не найден при удалении', async () => {
      const productUid = 'non-existent-uid';

      mockRepository.findByUid.mockResolvedValue(null);

      await expect(service.remove(productUid)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findByUid).toHaveBeenCalledWith(productUid);
    });
  });
});
