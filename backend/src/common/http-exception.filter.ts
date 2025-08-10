import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

// Безопасная проверка ошибок Multer
type MulterLikeError = Error & { code: string };
function isMulterError(err: unknown): err is MulterLikeError {
  if (typeof err !== 'object' || err === null) return false;
  const anyErr = err as Record<string, unknown>;
  return anyErr.name === 'MulterError' && typeof anyErr.code === 'string';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Multer (загрузка файлов)
    if (isMulterError(exception)) {
      let message = 'Ошибка загрузки файла';
      if (exception.code === 'LIMIT_FILE_SIZE') {
        message = 'Файл слишком большой. Максимум 10 МБ.';
      } else if (exception.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Неверный тип файла. Допустимы: JPG, PNG, WEBP, GIF, SVG.';
      }
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      if (typeof raw === 'string') {
        response.status(status).json({ statusCode: status, message: raw });
        return;
      }
      if (raw && typeof raw === 'object') {
        response.status(status).json(raw as Record<string, unknown>);
        return;
      }
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
      return;
    }

    // Непредвиденные ошибки
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: 'Внутренняя ошибка сервера',
      error: 'Internal Server Error',
    });
  }
}
