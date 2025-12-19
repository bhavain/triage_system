import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; version: string } {
    return this.appService.getHello();
  }

  // Serve frontend for all non-API routes
  @Get('*')
  serveFrontend(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
