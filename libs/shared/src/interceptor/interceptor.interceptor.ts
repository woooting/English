import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

interface ResponseData {
  message?: string;
  code?: number;
  data?: unknown;
}

interface SuccessResponse<T = unknown> {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  success: true;
  data: T;
}

// 将bigint转换为字符串，并保留日期类型不变
const transformBigInt = (obj: unknown): unknown => {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(transformBigInt);
  }
  if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj;
    }
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        key,
        transformBigInt(value),
      ]),
    );
  }
  return obj;
};

@Injectable()
export class InterceptorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data: ResponseData) => {
        return {
          timestamp: new Date().toISOString(),
          path: request.url,
          message: data?.message || '请求成功',
          code: data?.code || 200,
          success: true,
          data: transformBigInt(data?.data) ?? null,
        };
      }),
    );
  }
}
