import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(take = 10, skip = 0) {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { name: 'asc' },
        take,
        skip,
      }),
      this.prisma.user.count(),
    ]);
    return { count: users.length, total, users };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
}
