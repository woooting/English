import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer'; //引入邮件服务的库
import { ConfigService } from '@nestjs/config'; //读取环境变量
@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null; //声明一个变量
  constructor(private readonly configService: ConfigService) {}
  // 初始化邮件服务
  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: Number(this.configService.get<string>('EMAIL_PORT')),
      secure: !!Number(this.configService.get<string>('EMAIL_USE_SSL')),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }
  /**
   * 发送邮件
   * @param to - 收件人邮箱地址
   * @param subject - 邮件主题
   * @param text - 邮件正文（HTML格式）
   * @returns 发送成功返回true，发送失败返回false
   */
  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter?.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html: text,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
