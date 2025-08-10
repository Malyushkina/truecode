import axios from 'axios';

jest.mock('axios', () => {
  const get = jest.fn();
  const post = jest.fn();
  const patch = jest.fn();
  const del = jest.fn();
  const instance = {
    get,
    post,
    patch,
    delete: del,
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      isCancel: jest.fn(),
    },
  };
});

import { productsApi } from '@/lib/api';

const createMock = (axios as any).create as jest.Mock;
const axiosInstance = createMock.mock.results[0].value as {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
  interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
};

const getMock = axiosInstance.get;
const postMock = axiosInstance.post;
const patchMock = axiosInstance.patch;
const deleteMock = axiosInstance.delete;

describe('frontend lib/api productsApi (more)', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
    (axios as any).isCancel.mockReset?.();
  });

  it('регистрирует request/response интерцепторы при создании клиента', () => {
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(axiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('request interceptor success: логирует и возвращает config', () => {
    const onFulfilled = axiosInstance.interceptors.request.use.mock
      .calls[0][0] as (cfg: any) => any;
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const cfg = { method: 'get', url: '/x' };
    const res = onFulfilled(cfg);
    expect(res).toBe(cfg);
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('request interceptor error: предупреждает и реджектит', async () => {
    const onRejected = axiosInstance.interceptors.request.use.mock
      .calls[0][1] as (err: any) => Promise<never>;
    (axios as any).isCancel.mockReturnValue(false);
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const err = new Error('req error');
    await expect(onRejected(err)).rejects.toBe(err);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('response interceptor success: логирует и возвращает response', () => {
    const onFulfilled = axiosInstance.interceptors.response.use.mock
      .calls[0][0] as (res: any) => any;
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const resp = { status: 200, config: { url: '/x' } };
    const res = onFulfilled(resp);
    expect(res).toBe(resp);
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('response interceptor error: предупреждает и реджектит (не отмена)', async () => {
    const onRejected = axiosInstance.interceptors.response.use.mock
      .calls[0][1] as (err: any) => Promise<never>;
    (axios as any).isCancel.mockReturnValue(false);
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const err = { response: { status: 500 }, message: 'server' };
    await expect(onRejected(err as any)).rejects.toBe(err as any);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('createProduct отправляет POST /products и возвращает data', async () => {
    postMock.mockResolvedValue({ data: { id: 1, uid: 'u1' } });
    const res = await productsApi.createProduct({
      name: 'A',
      price: 10,
      sku: 'S',
    });
    expect(postMock).toHaveBeenCalledWith('/products', {
      name: 'A',
      price: 10,
      sku: 'S',
    });
    expect(res).toEqual({ id: 1, uid: 'u1' });
  });

  it('updateProduct отправляет PATCH /products/:uid', async () => {
    patchMock.mockResolvedValue({ data: { id: 1, uid: 'u1' } });
    await productsApi.updateProduct('u1', { name: 'B' });
    expect(patchMock).toHaveBeenCalledWith('/products/u1', { name: 'B' });
  });

  it('deleteProduct отправляет DELETE /products/:uid', async () => {
    deleteMock.mockResolvedValue({ data: { ok: true } });
    await productsApi.deleteProduct('u1');
    expect(deleteMock).toHaveBeenCalledWith('/products/u1');
  });

  it('deleteImage отправляет DELETE /products/:uid/image', async () => {
    deleteMock.mockResolvedValue({ data: { ok: true } });
    await productsApi.deleteImage('u2');
    expect(deleteMock).toHaveBeenCalledWith('/products/u2/image');
  });

  it('getProduct пробрасывает ошибку; если не отмена — isCancel=false', async () => {
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    (axios as any).isCancel.mockReturnValue(false);
    getMock.mockRejectedValue(new Error('boom'));
    await expect(productsApi.getProduct('uid')).rejects.toBeTruthy();
    expect((axios as any).isCancel).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('getProducts пробрасывает ошибку; если отмена — isCancel=true', async () => {
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    (axios as any).isCancel.mockReturnValue(true);
    getMock.mockRejectedValue(new Error('abort'));
    await expect(productsApi.getProducts()).rejects.toBeTruthy();
    expect((axios as any).isCancel).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('getProducts пробрасывает ошибку; если не отмена — isCancel=false (ветка warn)', async () => {
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    (axios as any).isCancel.mockReturnValue(false);
    getMock.mockRejectedValue(new Error('fail'));
    await expect(productsApi.getProducts()).rejects.toBeTruthy();
    expect((axios as any).isCancel).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
