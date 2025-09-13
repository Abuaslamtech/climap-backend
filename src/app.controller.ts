import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): { status: string; message: string } {
    return this.appService.getHello();
  }
  @Get('test-db')
  async testDb() {
    const userCount = await this.prisma.user.count();
    const facilityCount = await this.prisma.facility.count();
    return { ok: true, userCount, facilityCount };
  }
}
