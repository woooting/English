export interface EmailDigestJobData {
  text: string;
  email: string;
}

export const digestQueueName = {
  name: 'DIGEST_QUEUE', //消息队列的名称
  task: {
    emailDigest: 'EMAIL_DIGEST_TASK', //邮件任务
    everyDayDigest: 'EVERY_DAY_DIGEST_TASK', //每天任务
  },
};
