import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FeedbackSource,
  CustomerTier,
  FeedbackMetadata,
} from '../../../common/interfaces/feedback.interface';

/**
 * Base feedback DTO with common fields
 * Allows additional source-specific properties via [key: string]: any
 * This enables payload normalization for different sources
 */
export class CreateFeedbackItemDto {
  @IsEnum(FeedbackSource)
  @IsOptional() // Source is optional as it can be inferred from source-specific fields
  source?: FeedbackSource;

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

  // Allow additional properties for source-specific fields
  [key: string]: any;
}

/**
 * Support Ticket specific payload
 * Example: { source: "support", content: "...", ticket_id: "TKT-123", channel: "email", ... }
 */
export class SupportTicketDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  ticket_id: string;

  @IsEnum(['email', 'chat', 'phone'])
  @IsNotEmpty()
  channel: 'email' | 'chat' | 'phone';

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;

  @IsString()
  @IsOptional()
  customer_company?: string;

  @IsString()
  @IsOptional()
  assigned_agent?: string;

  @IsNumber()
  @IsOptional()
  resolution_time?: number;
}

/**
 * NPS Survey specific payload
 * Example: { source: "nps", content: "...", nps_score: 8, survey_campaign: "Q1-2024", ... }
 */
export class NPSSurveyDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  nps_score: number;

  @IsString()
  @IsOptional()
  survey_campaign?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;

  @IsString()
  @IsOptional()
  customer_company?: string;

  @IsString()
  @IsOptional()
  response_date?: string;
}

/**
 * App Store Review specific payload
 * Example: { source: "appstore", content: "...", store: "ios", app_version: "2.1.0", star_rating: 4, ... }
 */
export class AppStoreReviewDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['ios', 'android'])
  @IsNotEmpty()
  store: 'ios' | 'android';

  @IsString()
  @IsNotEmpty()
  app_version: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  star_rating: number;

  @IsString()
  @IsOptional()
  reviewer_username?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;
}

/**
 * Social Media Mention specific payload
 * Example: { source: "social", content: "...", platform: "twitter", author_handle: "@user", post_url: "...", ... }
 */
export class SocialMentionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['twitter', 'linkedin', 'reddit'])
  @IsNotEmpty()
  platform: 'twitter' | 'linkedin' | 'reddit';

  @IsString()
  @IsNotEmpty()
  author_handle: string;

  @IsNumber()
  @IsOptional()
  engagement_count?: number;

  @IsUrl()
  @IsOptional()
  post_url?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsEnum(CustomerTier)
  @IsOptional()
  customer_tier?: CustomerTier;
}

/**
 * Union type for all source-specific DTOs
 */
export type SourceSpecificFeedbackDto =
  | SupportTicketDto
  | NPSSurveyDto
  | AppStoreReviewDto
  | SocialMentionDto;

/**
 * Batch create DTO that accepts items with different payload shapes
 * Note: We don't use @Type transformation here to allow arbitrary source-specific fields
 * The normalization happens in the service layer
 */
export class BatchCreateFeedbackDto {
  @IsArray()
  items: any[]; // Accept any array for flexibility with source-specific payloads
}
