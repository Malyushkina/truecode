import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/products.repository';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import { QueryProductsDto } from '../../src/products/dto/query-products.dto';
import { NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => {
  const destroy = jest.fn();
  const upload_stream = jest.fn(
    (
      opts: unknown,
      cb: (
        err: unknown,
        res?: { secure_url: string; public_id: string },
      ) => void,
    ) => {
      return {
        end: () => {
          // симулируем успешную загрузку
          cb(null, {
            secure_url:
              'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            public_id: 'new-public-id',
          });
        },
      };
    },
  );
  const config = jest.fn();
  return { v2: { uploader: { upload_stream, destroy }, config } };
});

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

  /**
   * create
   */
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

    it('должен маппить Prisma P2002 на ConflictException при создании', async () => {
      const dto: CreateProductDto = {
        name: 'Test',
        price: 10,
        sku: 'DUP',
      };
      mockRepository.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  /**
   * findAll
   */
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

  /**
   * findOne
   */
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

  /**
   * update
   */
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

    it('должен маппить Prisma P2002 на ConflictException при обновлении', async () => {
      const productUid = 'some-uid';
      const updateProductDto: UpdateProductDto = { sku: 'DUP' };

      mockRepository.findByUid.mockResolvedValue({ uid: productUid });
      mockRepository.updateByUid.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.update(productUid, updateProductDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  /**
   * remove
   */
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

  /**
   * image operations
   */
  describe('image operations', () => {
    const uid = 'uid-1';
    const baseProduct = {
      id: 1,
      uid,
      name: 'Name',
      price: 10,
      sku: 'SKU-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
    };

    it('attachImage: удаляет старое изображение и сохраняет новое', async () => {
      const productWithImage = {
        ...baseProduct,
        imagePublicId: 'old-public-id',
      };
      mockRepository.findByUid.mockResolvedValue(productWithImage);
      mockRepository.updateByUid.mockResolvedValue({
        ...productWithImage,
        imageUrl: 'new-url',
        imagePublicId: 'new-public-id',
      });

      const res = await service.attachImage(uid, {
        buffer: Buffer.from('abc'),
      });

      expect(cloudinary.config).toHaveBeenCalled();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('old-public-id');
      expect(mockRepository.updateByUid).toHaveBeenCalledWith(uid, {
        imageUrl: expect.stringContaining('https://res.cloudinary.com/'),
        imagePublicId: 'new-public-id',
      });
      expect(res.imagePublicId).toBe('new-public-id');
    });

    it('attachImage: логирует warn и продолжает при ошибке destroy', async () => {
      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      const productWithImage = {
        ...baseProduct,
        imagePublicId: 'old-public-id',
      };
      mockRepository.findByUid.mockResolvedValue(productWithImage);
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      mockRepository.updateByUid.mockResolvedValue({
        ...productWithImage,
        imageUrl: 'new-url',
        imagePublicId: 'new-public-id',
      });

      await service.attachImage(uid, { buffer: Buffer.from('abc') });

      expect(warnSpy).toHaveBeenCalled();
      expect(mockRepository.updateByUid).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('detachImage: удаляет изображение если есть imagePublicId', async () => {
      const productWithImage = { ...baseProduct, imagePublicId: 'to-del' };
      mockRepository.findByUid.mockResolvedValue(productWithImage);
      mockRepository.updateByUid.mockResolvedValue({
        ...productWithImage,
        imageUrl: null,
        imagePublicId: null,
      });

      const res = await service.detachImage(uid);

      expect(cloudinary.config).toHaveBeenCalled();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('to-del');
      expect(mockRepository.updateByUid).toHaveBeenCalledWith(uid, {
        imageUrl: null,
        imagePublicId: null,
      });
      expect(res.imagePublicId).toBeNull();
    });

    it('detachImage: логирует warn и продолжает при ошибке destroy', async () => {
      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      const productWithImage = { ...baseProduct, imagePublicId: 'to-del' };
      mockRepository.findByUid.mockResolvedValue(productWithImage);
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      mockRepository.updateByUid.mockResolvedValue({
        ...productWithImage,
        imageUrl: null,
        imagePublicId: null,
      });

      await service.detachImage(uid);

      expect(warnSpy).toHaveBeenCalled();
      expect(mockRepository.updateByUid).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('detachImage: не вызывает destroy если imagePublicId отсутствует', async () => {
      mockRepository.findByUid.mockResolvedValue({
        ...baseProduct,
        imagePublicId: null,
      });
      mockRepository.updateByUid.mockResolvedValue({
        ...baseProduct,
        imageUrl: null,
        imagePublicId: null,
      });

      await service.detachImage(uid);

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
      expect(mockRepository.updateByUid).toHaveBeenCalledWith(uid, {
        imageUrl: null,
        imagePublicId: null,
      });
    });
  });
});
