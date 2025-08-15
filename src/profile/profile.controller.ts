import { Controller, Post, Body, UnauthorizedException, Get, Param, ValidationPipe, Query, Put, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ErrorBody, ResponseBody } from 'src/common/response-body';

import { ProfileService } from './profile.service';
import { ProfileDto } from './dto/profile.dto';
import { Profile } from './profile.model';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureStorageService } from 'src/shared/azura.service';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private readonly azuraStorage:AzureStorageService
) {}

@ApiBearerAuth('token')
@Put('update')
@ApiOperation({ summary: 'Update current user profile' })
@ApiResponse({
  status: 200,
  description: 'Profile updated successfully',
  type: ResponseBody, // You can also create ProfileResponseDto for better typing
})
@ApiResponse({ status: 400, description: 'Invalid data' })
  async updateProfile(
    @CurrentUser() user: User, // Authenticated user
    @Body() data: ProfileDto
  ) {
    const profile =  this.profileService.updateProfile(user.id, data);
    return new ResponseBody(true,"Profile Update Successfully",profile)
  }


@ApiBearerAuth('token')
@Post('update-image')
@ApiOperation({ summary: 'Upload and update profile image' })
@ApiResponse({ status: 200, description: 'Profile image updated', type: ResponseBody })
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'Profile image file',
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'Profile image file',
      },
    },
    required: ['file'],
  },
})
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {

    const image = await this.azuraStorage.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );


    await this.profileService.updateProfileImage(user.id, image.name);

    return new ResponseBody(true,"Profile Image Update Successfully",image.url)
  }
}
