import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor.interceptor';
import { Config } from '@en/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.listen(Config.ports.server);
}
bootstrap();
