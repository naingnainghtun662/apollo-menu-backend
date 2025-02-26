import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL], // Allowlist Next.js frontend URL
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  //   @SubscribeMessage('messageToServer')
  //   @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  //   handleMessage(
  //     @MessageBody() data: MessageDto,
  //     @ConnectedSocket() client: Socket,
  //   ): void {
  //     console.log(`Valid message received from client:`, data);

  //     // Emit message to all connected clients in the same branchId room
  //     client.to(data.branchId).emit('messageToClient', {
  //       message: data.message,
  //       branchId: data.branchId,
  //     });
  //   }

  @SubscribeMessage('joinBranch')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  handleJoinBranch(
    @MessageBody() branchId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!branchId) {
      console.warn(`Client ${client.id} sent an invalid branchId.`);
      client.emit('error', { message: 'Invalid branchId.' });
      return;
    }

    console.log(`Client ${client.id} joined branch: ${branchId}`);
    client.join(branchId);
  }
}
