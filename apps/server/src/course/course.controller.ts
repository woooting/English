import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import type { Request } from 'express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Get('list')
  findAll() {
    return this.courseService.getCouresList();
  }
  @UseGuards(AuthGuard)
  @Get('my-list')
  findMyList(@Req() req: Request) {
    return this.courseService.getMyCourseList(req.user.userId);
  }
}
