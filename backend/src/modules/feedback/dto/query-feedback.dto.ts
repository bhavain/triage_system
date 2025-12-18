import { IsEnum, IsOptional, IsInt, Min, Max, IsString, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FeedbackSource,
  FeedbackStatus,
  CustomerTier,
  Sentiment,
} from '../../../common/interfaces/feedback.interface';

export class QueryFeedbackDto {
  @IsEnum(FeedbackSource)
  @IsOptional()
  source?: FeedbackSource;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;

  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsEnum(Sentiment)
  @IsOptional()
  sentiment?: Sentiment;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  min_urgency?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  max_urgency?: number;

  @IsISO8601()
  @IsOptional()
  date_from?: string;

  @IsISO8601()
  @IsOptional()
  date_to?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(['urgency_score', 'created_at', 'frequency_count'])
  @IsOptional()
  sort_by?: 'urgency_score' | 'created_at' | 'frequency_count';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sort_order?: 'asc' | 'desc';

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
