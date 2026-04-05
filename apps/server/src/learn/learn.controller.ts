import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { LearnService } from './learn.service';
import type { Request } from 'express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('learn')
@UseGuards(AuthGuard)
export class LearnController {
  constructor(private readonly learnService: LearnService) {}

  @Post('word/save')
  create(@Body() { wordIds }: { wordIds: string[] }, @Req() req: Request) {
    return this.learnService.saveWordMaster(wordIds, req.user.userId);
  }

  @Get('word/:courseId')
  findAll(@Param('courseId') courseId: string, @Req() req: Request) {
    return this.learnService.getWordList(courseId, req.user.userId);
  }
}
