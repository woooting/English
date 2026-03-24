import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  getHello(): string {
    return this.aiService.getHello();
  }

  // 测试拦截器 - 应该返回包装后的格式
  @Get('test')
  testInterceptor() {
    return {
      message: '测试成功',
      code: 200,
      data: {
        id: BigInt(123), // 测试 bigint 转换
        name: '测试数据',
        createdAt: new Date(), // 测试日期保留
      },
    };
  }

  // 测试异常过滤器 - 应该返回包装后的错误格式
  @Get('error')
  testError() {
    throw new HttpException('测试异常', HttpStatus.BAD_REQUEST);
  }
}
