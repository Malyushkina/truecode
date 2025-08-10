import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('AppModule', () => {
  it('должен компилироваться без ошибок', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(moduleRef).toBeDefined();
  });
});
