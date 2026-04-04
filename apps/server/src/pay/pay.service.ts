import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CreatePayDto } from '@en/common/pay';
import { TokenPayload } from '@en/common/user';
import { SocketGateway } from '../socket/socket.gateway';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
import {
  PrismaService,
  PayService as SharedPayService,
  ResponseService,
} from '@libs/shared';
import { nanoid } from 'nanoid';
import type { Request } from 'express';
import dayjs from 'dayjs';
@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedPayService: SharedPayService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {}
  private getOutTradeNo() {
    const prefix = 'pay_';
    return `${prefix}${nanoid(12)}`;
  }
  async create(createPayDto: CreatePayDto, user: TokenPayload) {
    //已购买的课程不可再购买
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        userId: user.userId,
        courseId: createPayDto.courseId,
      },
    });
    if (courseRecord) {
      return this.responseService.error(null, '您已经购买过该课程');
    }

    const res = await this.prismaService.$transaction(async (tx) => {
      //1. 创建订单表 但是状态是未支付
      const outTradeNo = this.getOutTradeNo();
      await tx.paymentRecord.create({
        data: {
          userId: user.userId, //用户id
          outTradeNo: outTradeNo, //订单编号
          amount: createPayDto.total_amount, //支付金额
          subject: createPayDto.subject, //支付主题
          body: createPayDto.body, //支付内容
        },
      });
      //2.支付宝SDK发起支付生成url
      const dateTime = dayjs().add(1, 'minute'); //当前的时间增加了一分钟 为了测试我弄的快一点
      const payUrl = this.sharedPayService
        .getAlipaySdk()
        .pageExecute('alipay.trade.page.pay', 'GET', {
          bizContent: {
            out_trade_no: outTradeNo, //订单编号
            total_amount: createPayDto.total_amount, //支付金额
            subject: createPayDto.subject, //支付主题
            body: JSON.stringify({
              courseId: createPayDto.courseId, //课程id
              userId: user.userId, //用户id
            }), //支付内容
            product_code: 'FAST_INSTANT_TRADE_PAY', //产品编码
            time_expire: dateTime.format('YYYY-MM-DD HH:mm:ss'),
          },
          //给支付宝提供回调接口地址
          notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`,
        });
      return {
        payUrl, //返回支付宝的支付链接
        timeExpire: dateTime.toDate().getTime(), //迎合Elementplus组件要求是时间戳
      };
    });
    return this.responseService.success(res);
  }

  // 支付宝的回调函数
  //更新支付表中的 支付状态，支付宝交易号，支付时间
  async notify(req: Request) {
    await this.prismaService.$transaction(async (tx) => {
      //1.更新支付库 支付时间 + 支付宝交易号 + 支付状态
      const paymentRecord = await tx.paymentRecord.update({
        where: {
          outTradeNo: req.body.out_trade_no as string, //拿到了订单编号
        },
        data: {
          tradeNo: req.body.trade_no as string, //拿到了支付宝交易号
          tradeStatus: TradeStatus.TRADE_SUCCESS, //拿到了支付状态
          sendPayTime: dayjs(req.body.gmt_payment as string).toDate(), //拿到了支付时间
        },
      });
      //2.创建我的课程
      const body = JSON.parse(req.body.body) as {
        courseId: string;
        userId: string;
      };
      await tx.courseRecord.create({
        data: {
          userId: body.userId, //拿到了用户id
          courseId: body.courseId, //拿到了课程id
          isPurchased: true, //是否购买
          paymentRecordId: paymentRecord.id, //拿到了支付记录id
        },
      });
      //加一个通知前端socket
      this.socketGateway.emitPaymentSuccess(body.userId);
    });
    return true;
  }
}
