import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';
import { HttpExceptionFilter } from '../../src/common/http-exception.filter';

describe('ProductsController image upload (integration-light)', () => {
  let app: INestApplication;
  const mockService = {
    attachImage: jest.fn(async (uid: string, file: { buffer: Buffer }) => ({
      uid,
      imageUrl: 'url',
      imagePublicId: 'pid',
    })),
    detachImage: jest.fn(async (uid: string) => ({
      uid,
      imageUrl: null,
      imagePublicId: null,
    })),
  } as Partial<ProductsService> as ProductsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /products/:uid/image без файла → 400', async () => {
    const res = await request(app.getHttpServer()).post(
      '/products/uid-1/image',
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Неверный тип файла/i);
  });

  it('POST /products/:uid/image c неверным mimetype → 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/products/uid-1/image')
      .attach('file', Buffer.from('data'), {
        filename: 'a.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Неверный тип файла/i);
  });

  it('POST /products/:uid/image c image/png → 200 и вызов attachImage', async () => {
    const res = await request(app.getHttpServer())
      .post('/products/uid-2/image')
      .attach('file', Buffer.from('pngdata'), {
        filename: 'a.png',
        contentType: 'image/png',
      });
    expect(res.status).toBe(201 /* created by default for POST */ || 200);
    expect(mockService.attachImage).toHaveBeenCalled();
  });

  it('DELETE /products/:uid/image → 200 и вызов detachImage', async () => {
    const res = await request(app.getHttpServer()).delete(
      '/products/uid-3/image',
    );
    expect(res.status).toBe(200);
    expect(mockService.detachImage).toHaveBeenCalledWith('uid-3');
  });
});
