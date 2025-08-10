import { PrismaService } from '../../src/prisma/prisma.service';

describe('PrismaService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  it('маскирует DATABASE_URL в логе вне тестовой среды', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Конструктор не должен падать
    new PrismaService();

    const calls = spy.mock.calls.map((c) => String(c.join(' ')));
    const hasMasked = calls.some(
      (s) => s.includes('Prisma DATABASE_URL:') && s.includes('://***:***@'),
    );
    expect(hasMasked).toBe(true);
  });

  it('onModuleInit вызывает $connect, onModuleDestroy вызывает $disconnect', async () => {
    const service = new PrismaService();
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connectSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
