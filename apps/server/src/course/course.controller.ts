import { Controller, Get } from '@nestjs/common';
import { CourseService } from './course.service';
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Get('list')
  findAll() {
    console.log('123');
    return this.courseService.getCouresList();
  }
}
