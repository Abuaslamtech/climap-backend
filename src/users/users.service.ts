import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  state: true,
  lga: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(take = 10, skip = 0) {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { name: 'asc' },
        take,
        skip,
        select: safeUserSelect,
      }),
      this.prisma.user.count(),
    ]);
    return { count: users.length, total, users };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: safeUserSelect,
    });
  }
}
