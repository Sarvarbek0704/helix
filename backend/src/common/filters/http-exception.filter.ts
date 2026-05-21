import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (() => {
          const r = exception.getResponse();
          if (typeof r === 'string') return r;
          if (typeof r === 'object' && (r as any).message) {
            const m = (r as any).message;
            return Array.isArray(m) ? m[0] : m;
          }
          return 'An error occurred';
        })()
      : 'Internal server error';

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : {};

    response.status(status).json({
      statusCode: status,
      message,
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
