import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log('connected');
    if (userId) {
      await client.join(`user_${userId}`);
    }
  }
  emitPaymentSuccess(userId: string) {
    //这是通知房间内的用户触发这个事件
    this.server.to(`user_${userId}`).emit('paymentSuccess', userId);
  }
}
