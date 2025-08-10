import { ValidationPipe } from '@nestjs/common';

describe('main bootstrap', () => {
  const originalEnv = process.env;
  let enableCorsMock: jest.Mock;
  let useMock: jest.Mock;
  let useGlobalFiltersMock: jest.Mock;
  let useGlobalPipesMock: jest.Mock;
  let listenMock: jest.Mock;
  let createMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    enableCorsMock = jest.fn();
    useMock = jest.fn();
    useGlobalFiltersMock = jest.fn();
    useGlobalPipesMock = jest.fn();
    listenMock = jest.fn().mockResolvedValue(undefined);

    createMock = jest.fn().mockResolvedValue({
      enableCors: enableCorsMock,
      use: useMock,
      useGlobalFilters: useGlobalFiltersMock,
      useGlobalPipes: useGlobalPipesMock,
      listen: listenMock,
    });

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: createMock },
    }));
    // Уберём шум логов
    jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined as unknown as void);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('инициализирует приложение: CORS, static, pipes, listen', async () => {
    process.env.PORT = '4000';

    await import('../../src/main');
    // подождать microtasks bootstrap()
    await Promise.resolve();

    expect(createMock).toHaveBeenCalled();

    // Проверяем enableCors вызов и опции
    expect(enableCorsMock).toHaveBeenCalledTimes(1);
    const corsOpts = enableCorsMock.mock.calls[0][0];
    expect(corsOpts.credentials).toBe(true);
    expect(corsOpts.methods).toEqual([
      'GET',
      'POST',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ]);

    // Проверяем static /uploads
    const useArgs = useMock.mock.calls.find((c) => c[0] === '/uploads');
    expect(useArgs).toBeTruthy();

    // Проверяем pipes
    expect(useGlobalPipesMock).toHaveBeenCalled();
    const pipeArg = useGlobalPipesMock.mock.calls[0][0];
    expect(pipeArg && pipeArg.constructor && pipeArg.constructor.name).toBe(
      'ValidationPipe',
    );

    // Проверяем listen на порту
    expect(listenMock).toHaveBeenCalledWith('4000');
  });

  it('CORS origin callback: разрешает allowed и отклоняет остальные', async () => {
    await import('../../src/main');
    await Promise.resolve();

    const corsOpts = enableCorsMock.mock.calls[0][0] as {
      origin: (
        origin: string | undefined,
        cb: (err: Error | null, ok?: boolean) => void,
      ) => void;
    };

    // без origin — разрешаем
    await new Promise<void>((resolve, reject) => {
      corsOpts.origin(undefined, (err, ok) => {
        if (err) return reject(err);
        expect(ok).toBe(true);
        resolve();
      });
    });

    // allowed по умолчанию localhost:3000
    await new Promise<void>((resolve, reject) => {
      corsOpts.origin('http://localhost:3000', (err, ok) => {
        if (err) return reject(err);
        expect(ok).toBe(true);
        resolve();
      });
    });

    // неразрешённый источник
    await new Promise<void>((resolve) => {
      corsOpts.origin('http://evil.com', (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve();
      });
    });
  });
});
