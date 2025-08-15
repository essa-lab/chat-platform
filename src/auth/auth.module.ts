import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [ AuthService
    
    
    ],
  exports: [AuthService],
})
export class AuthModule {}
