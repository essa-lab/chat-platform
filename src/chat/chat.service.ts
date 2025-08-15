import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { PaginatedResponse, PaginationMeta, ResponseBody } from 'src/common/response-body';
import { MessageListDto } from './dto/message-list.dto';
import { Message } from '@prisma/client';
import { PrivateMessageDto } from './dto/private-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AzureStorageService } from 'src/shared/azura.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService,private azuraService:AzureStorageService) {}

  async getPublicMessages(
    options: MessageListDto,
  ): Promise<{ messages: Message[]; meta: PaginationMeta }> {
    const { page } = options;

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { isPublic: true },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: { ['createdAt']: 'desc' },
      }),
      this.prisma.message.count({
        where: {
          isPublic: true,
        },
      }),
    ]);

    const messageResponse = await Promise.all(
  messages.map(async (message) => ({
    ...message,
    blobUrl: message.blobUrl ? await this.azuraService.getDownloadLink(message.blobUrl ):null

  })))

    return {
      messages: messageResponse,
      meta: {
        totalItems: total,
        currentPage: page,
        itemCount: messages.length,
        itemsPerPage: 10,

        totalPages: Math.ceil(total / 10),
      },
    };
  }

  async getPrivateMessages(fromId: number, toId: number, query: MessageListDto) {
  const { page = 1} = query;

  const messages = await this.prisma.message.findMany({
    where: {
      OR: [
        { senderId: fromId, recipientId: toId },
        { senderId: toId, recipientId: fromId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * 10,
    take: 10,
  });

  const total = await this.prisma.message.count({
    where: {
      OR: [
        { senderId: fromId, recipientId: toId },
        { senderId: toId, recipientId: fromId },
      ],
    },
  });

  const messageResponse = await Promise.all(
  messages.map(async (message) => ({
    ...message,
    blobUrl: message.blobUrl ? await this.azuraService.getDownloadLink(message.blobUrl ):null

  })))

    return {
      messages: messageResponse,
      meta: {
        totalItems: total,
        currentPage: page,
        itemCount: messages.length,
        itemsPerPage: 10,

        totalPages: Math.ceil(total / 10),
      },
    };
  }

    async sendMessage(
    options: SendMessageDto,
  ): Promise<Message> {
    const { message ,senderId,recipientId} = options;
    const newMessage = await this.prisma.message.create({
        data:{
            isPublic: recipientId?false:true,
             senderId:senderId,
             recipientId:recipientId,
             content:message
            }
        }
      );
    return newMessage;
  }

async storeImageUrl(
    imageUrl: string,recipientId:number|null, senderId:number
  ): Promise<Message> {

    const newMessage = await this.prisma.message.create({
        data:{
            isPublic: recipientId?false:true,
             senderId:senderId,
             recipientId:recipientId,
             blobUrl:imageUrl
            }
        }
      );

      
    newMessage.blobUrl = await this.azuraService.getDownloadLink(
      imageUrl
    )
    
  


    return newMessage;
  }
}
