import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './user.model';
import { UserListDto } from './dto/user-list.dto';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationMeta } from 'src/common/response-body';
import { AzureStorageService } from 'src/shared/azura.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService,private azuraService:AzureStorageService) {}

  async getUsersList(
    options: UserListDto,
  ): Promise<{ users: User[]; meta: PaginationMeta }> {
    const { page, perPage, sortBy, sortOrder } = options;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: { profile: true },
      }),
      this.prisma.user.count(),
    ]);

    //get signed Url for profile images
    const userResponse = await Promise.all(
  users.map(async (user) => ({
    ...user,
    profile: user.profile
      ? {
          ...user.profile,
          profile_image: user.profile.profile_image
            ? await this.azuraService.getDownloadLink(user.profile.profile_image)
            : null
        }
      : null
  }))
);


    return {
      users: User.fromEntities(userResponse),
      meta: {
        totalItems: total,
        currentPage: page,
        itemCount: users.length,
        itemsPerPage: perPage,

        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async getUser(id: number): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
    where: { id },
    include: { profile: true },
  });

  if (user.profile?.profile_image) {
    user.profile.profile_image = await this.azuraService.getDownloadLink(
      user.profile.profile_image
    );
  }

  return User.fromEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { email: email } });

    return User.fromEntity(user);
  }
}
