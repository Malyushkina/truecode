import { renderHook, act } from '@testing-library/react';
import { useProductImage } from '@/hooks/use-product-image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

// Мокаем все зависимости (должно быть в начале файла)
jest.mock('@/lib/api', () => ({
  productsApi: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  },
}));

jest.mock('@/lib/image-validation', () => ({
  validateImageFile: jest.fn(),
  processImage: jest.fn(),
}));

// Мокаем React Query
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

// Импортируем моки после jest.mock
import { productsApi } from '@/lib/api';
import { validateImageFile, processImage } from '@/lib/image-validation';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: 1,
  uid: 'test-uid',
  name: 'Test',
  price: 1,
  sku: 'SKU',
  createdAt: '',
  updatedAt: '',
};

// Создаем моки для useMutation
const createMockMutation = (overrides = {}) => ({
  mutateAsync: jest.fn(),
  isPending: false,
  mutate: jest.fn(),
  data: undefined,
  error: null,
  variables: undefined,
  isError: false,
  isSuccess: false,
  isIdle: true,
  status: 'idle',
  failureCount: 0,
  failureReason: null,
  reset: jest.fn(),
  context: undefined,
  isPaused: false,
  submittedAt: 0,
  ...overrides,
});

describe('useProductImage', () => {
  let mockQueryClient: { invalidateQueries: jest.MockedFunction<() => void> };
  let mockInvalidateQueries: jest.MockedFunction<() => void>;

  beforeEach(() => {
    (useMutation as jest.Mock).mockImplementation(
      (opts: UseMutationOptions<unknown, unknown, unknown, unknown>) =>
        createMockMutation({
          mutateAsync: async (arg?: unknown) => {
            try {
              const r = await (
                opts.mutationFn as (v?: unknown) => Promise<unknown>
              )(arg);
              await act(async () => {
                await opts.onSuccess?.(r, arg as unknown, undefined as unknown);
              });
              return r;
            } catch (e) {
              await act(async () => {
                await opts.onError?.(
                  e as unknown,
                  arg as unknown,
                  undefined as unknown
                );
              });
              throw e;
            }
          },
        })
    );
    // Сбрасываем все моки
    jest.clearAllMocks();

    // Настраиваем моки по умолчанию
    (validateImageFile as jest.Mock).mockReturnValue({ ok: true });
    // По умолчанию обработка неуспешна, чтобы использовался исходный файл
    (processImage as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'skip',
    });
    (productsApi.uploadImage as jest.Mock).mockResolvedValue(mockProduct);
    (productsApi.deleteImage as jest.Mock).mockResolvedValue(mockProduct);

    // Мокаем React Query
    mockInvalidateQueries = jest.fn();
    mockQueryClient = {
      invalidateQueries: mockInvalidateQueries,
    };
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  it('должен инициализироваться с правильными начальными значениями', () => {
    // Мокаем useMutation: используем дефолтную реализацию без overrides

    const { result } = renderHook(() => useProductImage('test-uid'));

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.upload).toBe('function');
    expect(typeof result.current.removeImage).toBe('function');
    expect(typeof result.current.resetError).toBe('function');
  });

  describe('upload', () => {
    it('должен успешно загрузить изображение', async () => {
      // используем дефолтную реализацию useMutation

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.upload(file);

      // Проверяем, что функции были вызваны
      expect(validateImageFile).toHaveBeenCalledWith(file);
      expect(processImage).toHaveBeenCalledWith(file);
      expect(productsApi.uploadImage).toHaveBeenCalledWith('test-uid', file);
    });

    it('должен обработать ошибку валидации файла', async () => {
      (validateImageFile as jest.Mock).mockReturnValue({
        ok: false,
        error: 'Неверный тип файла',
      });

      // используем дефолтную реализацию useMutation без overrides

      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await expect(result.current.upload(file)).rejects.toThrow(
        'Неверный тип файла'
      );

      expect(validateImageFile).toHaveBeenCalledWith(file);
      expect(processImage).not.toHaveBeenCalled();
      expect(productsApi.uploadImage).not.toHaveBeenCalled();
    });

    it('должен обработать ошибку загрузки', async () => {
      (productsApi.uploadImage as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // используем дефолтную реализацию useMutation без overrides

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await expect(result.current.upload(file)).rejects.toThrow(
        'Network error'
      );
    });

    it('должен использовать обработанное изображение, если processImage успешен', async () => {
      const processedFile = new File([''], 'processed.jpg', {
        type: 'image/jpeg',
      });
      (processImage as jest.Mock).mockResolvedValue({
        ok: true,
        file: processedFile,
        width: 800,
        height: 600,
      });

      // используем дефолтную реализацию useMutation

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.upload(file);

      expect(productsApi.uploadImage).toHaveBeenCalledWith(
        'test-uid',
        processedFile
      );
    });

    it('должен использовать исходный файл, если processImage неуспешен', async () => {
      (processImage as jest.Mock).mockResolvedValue({
        ok: false,
        error: 'Ошибка обработки',
      });

      // используем дефолтную реализацию useMutation

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.upload(file);

      expect(productsApi.uploadImage).toHaveBeenCalledWith('test-uid', file);
    });
  });

  describe('removeImage', () => {
    it('должен успешно удалить изображение', async () => {
      // используем дефолтную реализацию useMutation

      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.removeImage();

      expect(productsApi.deleteImage).toHaveBeenCalledWith('test-uid');
    });

    it('должен обработать ошибку удаления', async () => {
      (productsApi.deleteImage as jest.Mock).mockRejectedValue(
        new Error('Delete error')
      );

      // используем дефолтную реализацию useMutation без overrides

      const { result } = renderHook(() => useProductImage('test-uid'));

      await expect(result.current.removeImage()).rejects.toThrow(
        'Delete error'
      );
    });
  });

  describe('состояния загрузки', () => {
    it('должен показывать состояние загрузки при upload', () => {
      (useMutation as jest.Mock)
        .mockReturnValueOnce(createMockMutation({ isPending: true })) // uploadMutation
        .mockReturnValueOnce(createMockMutation()); // deleteMutation

      const { result } = renderHook(() => useProductImage('test-uid'));

      expect(result.current.isUploading).toBe(true);
    });

    it('должен показывать состояние загрузки при removeImage', () => {
      (useMutation as jest.Mock)
        .mockReturnValueOnce(createMockMutation()) // uploadMutation
        .mockReturnValueOnce(createMockMutation({ isPending: true })); // deleteMutation

      const { result } = renderHook(() => useProductImage('test-uid'));

      expect(result.current.isUploading).toBe(true);
    });
  });

  describe('resetError', () => {
    it('должен сбрасывать ошибку', () => {
      (useMutation as jest.Mock)
        .mockReturnValueOnce(createMockMutation()) // uploadMutation
        .mockReturnValueOnce(createMockMutation()); // deleteMutation

      const { result } = renderHook(() => useProductImage('test-uid'));

      // Устанавливаем ошибку
      result.current.resetError();

      expect(result.current.error).toBe(null);
    });
  });

  describe('инвалидация кеша', () => {
    it('должен инвалидировать кеш после успешной загрузки', async () => {
      // используем дефолтную реализацию useMutation

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.upload(file);

      // Проверяем, что кеш был инвалидирован
      expect(mockInvalidateQueries).toHaveBeenCalled();
    });

    it('должен инвалидировать кеш после успешного удаления', async () => {
      // используем дефолтную реализацию useMutation

      const { result } = renderHook(() => useProductImage('test-uid'));

      await result.current.removeImage();

      // Проверяем, что кеш был инвалидирован
      expect(mockInvalidateQueries).toHaveBeenCalled();
    });
  });
});
