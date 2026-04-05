import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { digestQueueName, EmailDigestJobData } from './digest.queue';
import { DigestService } from './digest.service';
import { EmailService } from '@libs/shared';
@Processor(digestQueueName.name)
export class DigestProcessor extends WorkerHost {
  constructor(
    private readonly digestService: DigestService,
    private readonly emailService: EmailService,
  ) {
    super();
  }
  async process(job: Job<EmailDigestJobData>) {
    if (job.name === digestQueueName.task.everyDayDigest) {
      await this.digestService.handleEmailDigest();
      console.log('每天任务消费成功');
    }
    if (job.name === digestQueueName.task.emailDigest) {
      const { text, email } = job.data;
      await this.emailService.sendEmail(email, '每日学习摘要', text);
      console.log('发送成功');
    }
  }
}
