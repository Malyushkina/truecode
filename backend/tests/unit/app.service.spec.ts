import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../../src/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('должен возвращать "Hello World!"', () => {
      const result = service.getHello();
      expect(result).toBe('Hello World!');
    });

    it('должен возвращать строку', () => {
      const result = service.getHello();
      expect(typeof result).toBe('string');
    });

    it('должен возвращать непустую строку', () => {
      const result = service.getHello();
      expect(result.length).toBeGreaterThan(0);
    });

    it('должен всегда возвращать одно и то же значение', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      const result3 = service.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('Hello World!');
    });
  });
});
