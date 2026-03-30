import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatRoleType, ChatDto } from '@en/common/chat';
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain';
import { createDeepSeek, createCheckpoint } from '../llm/llm.config';
import type { AIMessageChunk, ReactAgent } from 'langchain';
import { ResponseService } from '@libs/shared';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) {}
  private agents: Map<ChatRoleType, ReactAgent> = new Map(); // 创建一个 Map 对象存储不同角色的助手
  private checkpointer: PostgresSaver; // 创建一个 PostgresSaver 实例存储chat消息
  async onModuleInit() {
    //1.初始化这个checkpoint
    this.checkpointer = await createCheckpoint(); //幂等性 建表
    //2.创建多个Agent 配置model systemPrompt checkpointer
    for (const mode of chatMode) {
      const agent = createAgent({
        model: createDeepSeek(), //模型
        systemPrompt: mode.prompt, //系统提示词注入 提前准备文件chatMode
        checkpointer: this.checkpointer, //检查点 存chat消息
      });
      this.agents.set(mode.role, agent); //将配置存入map
    }
  }
  async streamCompletion(crateChatDto: ChatDto) {
    const id = `${crateChatDto.userId}-${crateChatDto.role}`;
    const agent = this.agents.get(crateChatDto.role);
    if (!agent) {
      throw new Error('模式不存在');
    }
    // 给llm发消息拿stream响应
    // stream() params{input,config} input是输入数据的对象 config可以配置唯一id做会话隔离 还可以控制流的输出模式streamMode
    const stream = await agent.stream(
      {
        messages: [{ role: 'human', content: crateChatDto.content }],
      },
      { configurable: { thread_id: id }, streamMode: 'messages' },
    );
    return stream;
  }

  async findAll(userId: string, role: ChatRoleType) {
    const historyMessages = await this.checkpointer.get({
      configurable: { thread_id: `${userId}-${role}` },
    });
    const list = historyMessages?.channel_values?.messages as AIMessageChunk[];
    //历史记录为空
    if (!list) {
      return this.responseService.success([]);
    }
    return this.responseService.success(
      list.map((item) => ({
        content: item.content,
        role: item.type,
      })),
    );
  }
}
