import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
@Injectable()
export class LearnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  async getWordList(id: string, userId: string) {
    const couseRecord = await this.prisma.courseRecord.findFirst({
      where: { userId, courseId: id, isPurchased: true },
      include: { course: true },
    });
    if (!couseRecord) {
      return this.response.error(null, '请先购买课程');
    }

    const courseType = couseRecord.course.value;
    const words = await this.prisma.wordBook.findMany({
      where: { [courseType]: true, wordBookRecords: { none: { userId } } },
      skip: 0,
      take: 10,
      orderBy: { frq: 'desc' },
    });
    return this.response.success(words);
  }

  async saveWordMaster(wordIds: string[], userId: string) {
    const records = wordIds.map((wordId) => ({
      wordId,
      userId,
      isMaster: true,
    }));
    await this.prisma.wordBookRecord.createMany({
      data: records,
    });
    const res = await this.prisma.user.update({
      where: { id: userId },
      data: { wordNumber: { increment: wordIds.length } },
    });
    return this.response.success({ wordNumber: res.wordNumber });
  }
}
