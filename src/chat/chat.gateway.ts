import { UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JweService } from 'src/shared/jwe.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jweService: JweService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: any) {
    const token =
      client.handshake.auth?.token || client.handshake.headers['authorization'];
    if (!token) {
      client.disconnect(true);
      return;
    }
    let payload: any;

    try {
      payload = await this.jweService.decrypt(token);
    } catch (err) {
      client.disconnect(true);
    }

    try {
      await this.jweService.verifyPayload(payload);
      // TO-DO : refresh it
      
    } catch (err) {
      client.disconnect(true);
    }

    (client as any).user = { id: payload.sub, username: payload.username };

    try {
      client.join('public_room');
      console.log('Client connected:', client.id);
    } catch (err) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user) {
      console.log(`User ${client.id} disconnected`);
    }
  }

  @SubscribeMessage('public_message')
  async handlePublicMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;

    await this.chatService.sendMessage({
      message: message,
      senderId: user.id,
      recipientId: null,
    });
    this.server.to('public_room').emit('public_message', {
      sender: user.id,
      message,
    });
  }

  private getRoomName(userId, recipientId) {
    return [userId, recipientId].sort().join('_');
  }
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { recipientId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getRoomName(
      (client as any).user.id,
      data.recipientId,
    );
    client.join(roomName);
  }

  @SubscribeMessage('private_message')
  async handlePrivateMessage(
    @MessageBody() data: { recipientId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).user.id;
    const roomName = this.getRoomName(userId, data.recipientId);

    this.chatService.sendMessage({
      message: data.message,
      senderId: userId,
      recipientId: data.recipientId,
    });

    client
      .to(roomName)
      .emit('private_message', { senderId: userId, message: data.message });
  }

  @SubscribeMessage('send_image')
  async handleSendImage(
    @MessageBody() data: { recipientId?: number; imageUrl: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).user.id;

    if (data.recipientId) {
      // Private chat mode
      const roomName = this.getRoomName(userId, data.recipientId);
      client.to(roomName).emit('image_sent', {
        senderId: userId,
        message: data.imageUrl,
      });
    } else {
      // Public chat mode
      client.to('public_room').emit('image_sent', {
        senderId: userId,
        message: data.imageUrl,
      });
    }
  }
}
