import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string } {
    return {
      message: 'Customer Feedback Triage System API',
      version: '1.0.0',
    };
  }
}
