import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/user/user.model';
import { PrismaService } from 'prisma/prisma.service';
import { JweService } from 'src/shared/jwe.service';



@Injectable()
export class AuthService {
  constructor(private readonly jweService: JweService,private readonly prismaService:PrismaService) {}

  async validateUser(email: string, password: string) {
     const user = await this.prismaService.user.findFirst({ where: { email:email } });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    return User.fromEntity(user);
  }

  async login(user: User) {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * 60 * 24; // 24 hours
    const payload = {
      sub: user.id,
      username: user.username,
      iat: now,
      exp: now + expiresIn,
    };
    const jwe = await this.jweService.encrypt(payload);
    return { access_token: jwe, expires_in: expiresIn };
  }

  async register(dto: RegisterDto) {
   await this.prismaService.user.create({
    data: {
      email: dto.email,
      username: dto.username,
      password: await bcrypt.hash(dto.password, 10),
      profile: {
        create: {
          full_name: dto.full_name ?? null,
          location: dto.location ?? null,
          age: dto.age ? Number(dto.age) : null,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return true;
}



}
