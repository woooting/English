import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { InterceptorExceptionFilter } from '@libs/shared';
import { InterceptorInterceptor } from '@libs/shared';
import { Config } from '@en/config';
async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(Config.ports.ai);
}
bootstrap();
