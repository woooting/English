import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';

@Injectable()
export class CourseService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}
  async getCouresList() {
    const res = await this.prisma.course.findMany();
    const list = res.map((item) => ({
      ...item,
      price: Number(item.price).toFixed(2),
    }));
    return this.responseService.success(list);
  }
}
