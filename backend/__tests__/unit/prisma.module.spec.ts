import { Test } from '@nestjs/testing';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PrismaModule', () => {
  it('компилируется и предоставляет PrismaService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const service = moduleRef.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
    expect(typeof (service as any).$connect).toBe('function');
    expect(typeof (service as any).$disconnect).toBe('function');
  });
});
