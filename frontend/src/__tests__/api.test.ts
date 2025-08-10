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

// Получаем инстанс, созданный в productsApi через axios.create()
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

describe('frontend lib/api productsApi', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it('getProducts строит корректный querystring', async () => {
    getMock.mockResolvedValue({
      data: {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      },
    });
    await productsApi.getProducts({
      page: 2,
      limit: 5,
      search: 'abc',
      sortBy: 'price',
      sortOrder: 'asc',
      minPrice: 0,
      maxPrice: 10,
    });
    const urlCalled: string = getMock.mock.calls[0][0];
    expect(urlCalled).toContain('/products?');
    expect(urlCalled).toContain('page=2');
    expect(urlCalled).toContain('limit=5');
    expect(urlCalled).toContain('search=abc');
    expect(urlCalled).toContain('sortBy=price');
    expect(urlCalled).toContain('sortOrder=asc');
    // min/max = 0 не добавляются из-за truthy-проверок
    expect(urlCalled).not.toContain('minPrice=0');
    expect(urlCalled).not.toContain('maxPrice=0');
  });

  it('getProduct прокидывает signal', async () => {
    const controller = new AbortController();
    getMock.mockResolvedValue({ data: { id: 1 } });
    await productsApi.getProduct('uid', { signal: controller.signal });
    const opts = getMock.mock.calls[0][1];
    expect(opts.signal).toBe(controller.signal);
  });

  it('uploadImage ставит multipart заголовки', async () => {
    postMock.mockResolvedValue({ data: { id: 1 } });
    const file = new File([new Blob(['x'])], 'a.png', { type: 'image/png' });
    await productsApi.uploadImage('uid', file);
    const [url, body, opts] = postMock.mock.calls[0];
    expect(url).toBe('/products/uid/image');
    expect(body).toBeInstanceOf(FormData);
    expect(opts.headers['Content-Type']).toBe('multipart/form-data');
  });
});
