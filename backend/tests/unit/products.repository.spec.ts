import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from '../../src/products/products.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import { QueryProductsDto } from '../../src/products/dto/query-products.dto';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
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

      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      const result = await repository.create(createProductDto);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findMany', () => {
    it('должен возвращать список товаров с пагинацией', async () => {
      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
      };

      const mockProducts = [
        {
          id: 'test-id',
          name: 'Test Product',
          price: 100,
          sku: 'TEST-SKU-001',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockTotal = 1;

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockTotal);

      const result = await repository.findMany(query);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual({
        products: mockProducts,
        total: mockTotal,
      });
    });

    it('должен обрабатывать поиск', async () => {
      const query: QueryProductsDto = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await repository.findMany(query);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'test', mode: 'insensitive' } },
                { description: { contains: 'test', mode: 'insensitive' } },
                { sku: { contains: 'test', mode: 'insensitive' } },
              ],
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('должен обрабатывать фильтрацию по цене', async () => {
      const query: QueryProductsDto = {
        minPrice: 100,
        maxPrice: 500,
        page: 1,
        limit: 10,
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await repository.findMany(query);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              price: {
                gte: 100,
                lte: 500,
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
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

      mockPrismaService.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await repository.findById(productId);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('update', () => {
    it('должен обновлять товар', async () => {
      const productId = 'test-id';
      const updateProductDto: UpdateProductDto = {
        price: 150,
      };

      const updatedProduct = {
        id: productId,
        name: 'Test Product',
        price: 150,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await repository.update(productId, updateProductDto);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateProductDto,
      });
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('delete', () => {
    it('должен удалять товар', async () => {
      const productId = 'test-id';
      const deletedProduct = {
        id: productId,
        name: 'Test Product',
        price: 100,
        sku: 'TEST-SKU-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.delete.mockResolvedValue(deletedProduct);

      const result = await repository.delete(productId);

      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(deletedProduct);
    });
  });
});
