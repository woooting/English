import { ChatService } from './chat.service';
import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import type { ChatDto, ChatRoleType } from '@en/common/chat';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  async create(@Body() crateChatDto: ChatDto, @Res() res: Response) {
    //配置响应体 让前端用sse读取
    res.setHeader('Content-Type', 'text/event-stream'); //流式输出
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = await this.chatService.streamCompletion(crateChatDto);
    for await (const chunk of stream) {
      const [msg] = chunk;
      //按照sse格式返回数据对象

      res.write(
        `data: ${JSON.stringify({ content: msg.content, role: 'ai' })}\n\n`,
      );
    }
    return this.chatService.streamCompletion(crateChatDto);
  }

  @Get('history')
  findAll(@Query('userId') userId: string, @Query('role') role: ChatRoleType) {
    return this.chatService.findAll(userId, role);
  }
}
