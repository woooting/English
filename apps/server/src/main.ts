import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor.interceptor';
import { Config } from '@en/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(Config.ports.server);
}
bootstrap();
