import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

function statusToErrorCode(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const payload = this.normalizeException(exception);
    response.status(payload.statusCode).json({
      ...payload,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeException(exception: unknown): ErrorPayload {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();

      if (typeof raw === 'string') {
        return {
          statusCode,
          errorCode: statusToErrorCode(statusCode),
          message: raw,
        };
      }

      if (typeof raw === 'object' && raw !== null) {
        const candidate = raw as Record<string, unknown>;
        const message = this.pickMessage(candidate.message, exception.message);
        const details = Array.isArray(candidate.details)
          ? (candidate.details as Array<{ field: string; message: string }>)
          : undefined;

        return {
          statusCode:
            typeof candidate.statusCode === 'number'
              ? candidate.statusCode
              : statusCode,
          errorCode:
            typeof candidate.errorCode === 'string'
              ? candidate.errorCode
              : statusToErrorCode(statusCode),
          message,
          details,
        };
      }

      return {
        statusCode,
        errorCode: statusToErrorCode(statusCode),
        message: exception.message || 'HTTP exception',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message:
        exception instanceof Error ? exception.message : 'Unexpected server error',
    };
  }

  private pickMessage(
    rawMessage: unknown,
    fallbackMessage: string,
  ): string {
    if (typeof rawMessage === 'string') {
      return rawMessage;
    }
    if (Array.isArray(rawMessage) && rawMessage.length > 0) {
      const first = rawMessage.find((item) => typeof item === 'string');
      if (typeof first === 'string') {
        return first;
      }
    }
    return fallbackMessage || 'Request failed';
  }
}
