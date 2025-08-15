import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  PaginatedResponse,
  ResponseBody,
} from 'src/common/response-body';
import { ChatService } from './chat.service';
import { MessageListDto } from './dto/message-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from '@prisma/client';
import { AzureStorageService } from 'src/shared/azura.service';

@Controller('api/chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly azuraStorage: AzureStorageService,
  ) {}

 @ApiBearerAuth('token')
@Get('public')
@ApiOperation({ summary: 'Get Public chat' })
@ApiResponse({
  status: 200,
  description: 'Messages List Object',
  type: ResponseBody, 
})
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'perPage', required: false, type: Number })
@ApiQuery({ name: 'sortBy', required: false, type: String })
@ApiQuery({ name: 'sortOrder', required: false, type: String })
  async getPublicMessages(@Query() query: MessageListDto) {
    const messages = await this.chatService.getPublicMessages(query);

    return new PaginatedResponse(
      messages.meta,
       'Message List', messages.messages,
    );
  }


  @ApiBearerAuth('token')
@Get('private/:from/:to')
@ApiOperation({ summary: 'Get private chat between two users' })
@ApiResponse({
  status: 200,
  description: 'Messages List Object',
  type: ResponseBody, 
})
@ApiQuery({ name: 'page', required: false, type: Number })
async getPrivateMessages(
  @Param('from') fromId: string,
  @Param('to') toId: string,
  @Query() query: MessageListDto,
) {
  const messages = await this.chatService.getPrivateMessages(Number(fromId), Number(toId), query);

  return new PaginatedResponse(messages.meta, 'Message List', messages.messages);
}

@ApiBearerAuth('token')
@Post('send-image')
@ApiOperation({ summary: 'Upload profile or chat image' })
@ApiResponse({ status: 200, description: 'Image sent successfully', type: ResponseBody })
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'image file',
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'file',
        format: 'binary',
        description: 'Profile image file',
      },
    },
    required: ['file'],
  },
})
@ApiBody({
  description: 'recipientId',
  schema: {
    type: 'string',
  },
})
  @UseInterceptors(FileInterceptor('file'))
  async sendImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('recipientId') recipientId: string | null,
    @CurrentUser() user: User,
  ) {
    const image = await this.azuraStorage.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );
    const publicImageUrl = await this.azuraStorage.getDownloadLink(image.name);

    await this.chatService.storeImageUrl(
      image.url,
      recipientId ? Number(recipientId) : null,
      user.id,
    );

    return new ResponseBody(
      true,
      'Message Send Image Successfully',
      publicImageUrl,
    );
  }

}
