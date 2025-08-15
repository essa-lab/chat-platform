import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './user/user.module';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from './shared/shared.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [SharedModule,AuthModule,UserModule,ProfileModule,ChatModule
],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
