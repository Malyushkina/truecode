import { HttpExceptionFilter } from '../../src/common/http-exception.filter';
import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';

interface ResponseMock {
  statusCode: number;
  body: unknown;
  status: (code: number) => ResponseMock;
  json: (payload: unknown) => ResponseMock;
}

function createResponseMock(): ResponseMock {
  const res: ResponseMock = {
    statusCode: 0,
    body: undefined,
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (payload: unknown) => {
      res.body = payload;
      return res;
    },
  };
  return res;
}

type HttpArgs = {
  getRequest: <T = unknown>() => T;
  getResponse: <T = unknown>() => T;
  getNext: <T = unknown>() => T;
};

function createHostMock(res: ResponseMock): ArgumentsHost {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const http: HttpArgs = {
    getRequest: <T = unknown>() => ({}) as T,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getResponse: <T = unknown>() => res as unknown as T,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getNext: <T = unknown>() => undefined as unknown as T,
  };
  const host = {
    switchToHttp: () => http,
    getType: () => 'http' as const,
    getArgs: () => [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getArgByIndex: (_: number) => undefined,
    switchToRpc: () => ({ getContext: () => undefined }),
    switchToWs: () => ({
      getClient: () => undefined,
      getData: () => undefined,
    }),
  };
  return host as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('returns 400 with friendly message for Multer LIMIT_FILE_SIZE', () => {
    const res = createResponseMock();
    const host = createHostMock(res);
    const multerErr = Object.assign(new Error('too big'), {
      name: 'MulterError',
      code: 'LIMIT_FILE_SIZE',
    });

    filter.catch(multerErr, host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'Файл слишком большой. Максимум 10 МБ.',
      error: 'Bad Request',
    });
  });

  it('returns 400 with friendly message for Multer LIMIT_UNEXPECTED_FILE', () => {
    const res = createResponseMock();
    const host = createHostMock(res);
    const multerErr = Object.assign(new Error('bad type'), {
      name: 'MulterError',
      code: 'LIMIT_UNEXPECTED_FILE',
    });

    filter.catch(multerErr, host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'Неверный тип файла. Допустимы: JPG, PNG, WEBP, GIF, SVG.',
      error: 'Bad Request',
    });
  });

  it('passes through HttpException string response', () => {
    const res = createResponseMock();
    const host = createHostMock(res);
    const err = new BadRequestException('Invalid payload');

    filter.catch(err, host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'Invalid payload',
      error: 'Bad Request',
    });
  });

  it('passes through HttpException object response', () => {
    const res = createResponseMock();
    const host = createHostMock(res);
    const err = new BadRequestException({
      statusCode: 400,
      message: 'oops',
      custom: true,
    });

    filter.catch(err, host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'oops',
      custom: true,
    });
  });

  it('returns 500 for unknown error', () => {
    const res = createResponseMock();
    const host = createHostMock(res);

    filter.catch(new Error('boom'), host);

    expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера',
      error: 'Internal Server Error',
    });
  });
});
