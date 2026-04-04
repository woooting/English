import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatRoleType, ChatDto } from '@en/common/chat';
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain';
import {
  createDeepSeek,
  createCheckpoint,
  createBochaSearch,
  createDeepSeekReasoner,
} from '../llm/llm.config';
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
    // for (const mode of chatMode) {
    //   const agent = createAgent({
    //     model: createDeepSeek(), //模型
    //     systemPrompt: mode.prompt, //系统提示词注入 提前准备文件chatMode
    //     checkpointer: this.checkpointer, //检查点 存chat消息
    //   });
    //   this.agents.set(mode.role, agent); //将配置存入map
    // }
  }
  async streamCompletion(createChatDto: ChatDto) {
    const defaultPrompt = chatMode.find(
      (item) => item.role === createChatDto.role,
    );
    if (!defaultPrompt) {
      throw new Error('模式不存在');
    }
    let prompt = defaultPrompt.prompt;
    if (createChatDto.webSearch) {
      const webSearchPrompt = await createBochaSearch(createChatDto.content);
      prompt += `请根据以下搜索结果回答问题：${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${createChatDto.content}`;
    }
    let model = createDeepSeek(); //默认是对话模型
    if (createChatDto.deepThink) {
      model = createDeepSeekReasoner(); //深度思考模型
    }
    const agent = createAgent({
      model: model,
      systemPrompt: prompt,
      checkpointer: this.checkpointer,
    });
    const id = `${createChatDto.userId}-${createChatDto.role}`;
    // 给llm发消息拿stream响应
    // stream() params{input,config} input是输入数据的对象 config可以配置唯一id做会话隔离 还可以控制流的输出模式streamMode
    const stream = await agent.stream(
      {
        messages: [{ role: 'human', content: createChatDto.content }],
      },
      { configurable: { thread_id: id }, streamMode: 'messages' },
    );
    return stream;
  }

  async findAll(userId: string, role: ChatRoleType) {
    const id = `${userId}-${role}`;
    const historyMessages = await this.checkpointer.get({
      configurable: { thread_id: id },
    });
    const list = historyMessages?.channel_values?.messages as AIMessageChunk[];
    //历史记录为空
    if (!list) {
      return this.responseService.success([]);
    }
    const data = list.map((item) => ({
      content: item.content,
      role: item.type,
    }));
    console.log('test', data);
    return this.responseService.success(
      list.map((item) => ({
        content: item.content,
        role: item.type,
        reasoning: item.additional_kwargs?.reasoning_content,
      })),
    );
  }
}
