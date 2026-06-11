import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; message: string } {
    return { status: 'OK', message: 'Endpoint is active' };
  }
}
