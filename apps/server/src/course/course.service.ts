import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
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

  async getMyCourseList(userId: string) {
    const res = await this.prisma.courseRecord.findMany({
      where: {
        userId,
        paymentRecord: {
          tradeStatus: TradeStatus.TRADE_SUCCESS,
        },
      },
      include: {
        course: true,
      },
    });
    const list = res.map((item) => ({
      ...item.course,
      price: Number(item.course.price).toFixed(2),
    }));
    return this.responseService.success(list);
  }
}
