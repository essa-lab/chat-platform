import { Injectable } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { Profile } from './profile.model';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

   async updateProfile(userId: number, data: ProfileDto): Promise<Profile> {
  return this.prisma.profile.update({
    where: { userId },
    data
  });
}

async updateProfileImage(userId: number, imageName: string) {
  return this.prisma.profile.update({
    where: { id: userId },
    data: { profile_image: imageName },
  });
}

}
