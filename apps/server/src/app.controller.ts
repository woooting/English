import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
type Data = {
  data: string;
};
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Data {
    return this.appService.getHello();
  }
}
