import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  BatchCreateFeedbackDto,
  CreateFeedbackItemDto,
} from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async createBatch(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false })) dto: BatchCreateFeedbackDto,
  ) {
    return this.feedbackService.createBatch(dto.items);
  }

  @Get()
  async findAll(@Query(ValidationPipe) query: QueryFeedbackDto) {
    return this.feedbackService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }
}
