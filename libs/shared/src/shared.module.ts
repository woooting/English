import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinIoModule } from './min-io/min-io.module';

@Global()
@Module({
  providers: [SharedService],
  exports: [
    SharedService,
    PrismaModule,
    ResponseModule,
    JwtModule,
    ConfigModule,
    MinIoModule,
  ],
  imports: [
    PrismaModule,
    ResponseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MinIoModule,
  ],
})
export class SharedModule {}
