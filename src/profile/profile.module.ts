import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserService } from 'src/user/user.service';


@Module({
  imports:[],
  controllers: [ProfileController],
  providers: [ProfileService,UserService,
],
})
export class ProfileModule {}
