//1.deepseek初始化一下
import { ChatDeepSeek } from '@langchain/deepseek';
import { ConfigService } from '@nestjs/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
//初始化deepseek模型
export const createDeepSeek = () => {
  const configService = new ConfigService();
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY'), //从环境变量中获取api key
    model: configService.get<string>('DEEPSEEK_API_MODEL'), //从环境变量中获取模型
    temperature: 1.3, //1.3翻译 + 通用对话
    maxTokens: 4396, //token限制
    streaming: true, //流式输出
  });
};
//2.初始化checkpoint
export const createCheckpoint = async () => {
  const configService = new ConfigService();
  const checkpointer = PostgresSaver.fromConnString(
    configService.get<string>('AI_DATABASE_URL')!,
  );
  await checkpointer.setup();
  return checkpointer;
};
