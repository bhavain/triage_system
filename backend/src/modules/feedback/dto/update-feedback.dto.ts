import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeedbackStatus } from '../../../common/interfaces/feedback.interface';

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsString()
  @IsOptional()
  assigned_to?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
