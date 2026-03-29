import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MinIoService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT')!,
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get('MINIO_SECRET_KEY')!,
    });
  }

  async onModuleInit() {
    const bucket = this.configService.get<string>('MINIO_BUCKET')!;
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket);
      await this.minioClient.setBucketPolicy(
        bucket,
        JSON.stringify({
          Version: '2012-10-17', //策略语言版本版本 类似于http版本 例如http1.1 http2.0 这个值固定即可
          Statement: [
            {
              Sid: 'PublicReadObjects', //给这个规则起一个名字
              Effect: 'Allow', //允许打开这个规则 Allow 允许 Deny 拒绝
              Principal: '*', //所有人
              Action: ['s3:GetObject'], //允许浏览器获取对象
              Resource: ['arn:aws:s3:::avatar/*'], //允许读取 avatar桶内的所有资源
            },
          ],
        }),
      );
    }
  }
  getClinet() {
    return this.minioClient;
  }
  getBucket() {
    return this.configService.get<string>('MINIO_BUCKET');
  }
}
