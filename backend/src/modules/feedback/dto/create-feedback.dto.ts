import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FeedbackSource,
  CustomerTier,
  FeedbackMetadata,
} from '../../../common/interfaces/feedback.interface';

export class CreateFeedbackItemDto {
  @IsEnum(FeedbackSource)
  @IsNotEmpty()
  source: FeedbackSource;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;

  @IsString()
  @IsOptional()
  customer_company?: string;

  @IsObject()
  @IsOptional()
  metadata?: FeedbackMetadata;
}

export class BatchCreateFeedbackDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackItemDto)
  items: CreateFeedbackItemDto[];
}
