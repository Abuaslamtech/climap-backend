import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; message: string } {
    return { status: 'OK', message: 'Endmpoint is active' };
  }
}
