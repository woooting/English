import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
type Data = {
  data: string;
};
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): Data {
    return { data: 'Hello World!' };
  }
}
