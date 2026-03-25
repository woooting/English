import { ResponseService, PrismaService } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import type { WordQuery } from '@en/common/word';
import type { Prisma } from '@libs/shared/generated/prisma/client';
@Injectable()
export class WordBookService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
  ) {}

  private toBolean(value: string | boolean): boolean | undefined {
    return value === 'true' ? true : undefined;
  }
  async findAll(query: WordQuery) {
    const { page = 1, pageSize = 12, word, ...rest } = query;
    const tags = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, this.toBolean(value)]),
    );
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...tags,
    };
    const total = await this.prismaService.wordBook.count({ where });
    const list = await this.prismaService.wordBook.findMany({
      where,
      orderBy: { frq: 'desc' },
      skip: (Number(page) - 1) * pageSize,
      take: Number(pageSize),
    });
    return this.responseService.success({ list, total });
  }
}
