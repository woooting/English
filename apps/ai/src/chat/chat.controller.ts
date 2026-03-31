import { ChatService } from './chat.service';
import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import type { ChatDto, ChatRoleType } from '@en/common/chat';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  async create(@Body() createChatDto: ChatDto, @Res() res: Response) {
    //配置响应体 让前端用sse读取
    res.setHeader('Content-Type', 'text/event-stream'); //流式输出
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = await this.chatService.streamCompletion(createChatDto);
    for await (const chunk of stream) {
      const [msg] = chunk;
      //按照sse格式返回数据对象
      const thinkMsg = msg.additional_kwargs?.reasoning_content ?? '';
      if (thinkMsg) {
        res.write(
          `data: ${JSON.stringify({ content: thinkMsg, role: 'ai', type: 'reasoning' })}\n\n`,
        );
      }
      const content = msg.content ?? ''; //普通Chat对话的内容
      if (content) {
        res.write(
          `data: ${JSON.stringify({ content: content, role: 'ai', type: 'chat' })}\n\n`,
        );
      }
    }
    res.end();
  }

  @Get('history')
  findAll(@Query('userId') userId: string, @Query('role') role: ChatRoleType) {
    return this.chatService.findAll(userId, role);
  }
}
