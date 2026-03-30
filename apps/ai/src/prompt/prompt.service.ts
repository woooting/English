import { Injectable } from '@nestjs/common';
import { chatMode } from './prompt.mode';
import { ResponseService } from '@libs/shared';

@Injectable()
export class PromptService {
  constructor(private response: ResponseService) {}
  findAll() {
    return this.response.success(
      chatMode.map((item) => {
        return {
          label: item.label,
          id: item.id,
          role: item.role,
        };
      }),
    );
  }
}
