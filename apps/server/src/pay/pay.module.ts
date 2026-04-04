import { Module } from '@nestjs/common';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { SocketModule } from '../socket/socket.module';

@Module({
  controllers: [PayController],
  providers: [PayService],
  imports: [SocketModule],
})
export class PayModule {}
