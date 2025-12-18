export enum FeedbackSource {
  SUPPORT = 'support',
  NPS = 'nps',
  APPSTORE = 'appstore',
  SOCIAL = 'social',
}

export enum FeedbackStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  ASSIGNED = 'assigned',
  RESOLVED = 'resolved',
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

export enum CustomerTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum CategoryType {
  BUG = 'bug',
  FEATURE = 'feature',
  COMPLAINT = 'complaint',
  PRAISE = 'praise',
  QUESTION = 'question',
}

export interface SupportTicketMetadata {
  ticket_id: string;
  channel: 'email' | 'chat' | 'phone';
  assigned_agent?: string;
  resolution_time?: number;
}

export interface NPSMetadata {
  nps_score: number; // 0-10
  survey_campaign?: string;
  response_date?: string;
}

export interface AppStoreMetadata {
  store: 'ios' | 'android';
  app_version: string;
  star_rating: number; // 1-5
  reviewer_username?: string;
}

export interface SocialMetadata {
  platform: 'twitter' | 'linkedin' | 'reddit';
  author_handle: string;
  engagement_count?: number;
  post_url?: string;
}

export type FeedbackMetadata =
  | SupportTicketMetadata
  | NPSMetadata
  | AppStoreMetadata
  | SocialMetadata
  | Record<string, any>;

export interface Customer {
  id: string;
  email: string;
  tier: CustomerTier;
  company_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  keywords: string[];
  description?: string;
  created_at: Date;
}

export interface Feedback {
  id: string;
  customer_id?: string;
  category_id?: number;
  source: FeedbackSource;
  content: string;
  urgency_score?: number;
  urgency_reasoning?: string;
  sentiment: Sentiment;
  status: FeedbackStatus;
  frequency_count: number;
  created_at: Date;
  updated_at: Date;
  metadata: FeedbackMetadata;
  customer?: Customer;
  category?: Category;
  tags?: string[];
}

export interface UrgencyAnalysisInput {
  feedback_content: string;
  customer_tier?: CustomerTier;
  category?: string;
  frequency_count: number;
  created_at: Date;
  source: FeedbackSource;
  metadata: FeedbackMetadata;
}

export interface UrgencyAnalysisResult {
  urgency_score: number;
  reasoning: string;
  recommended_action: 'immediate' | 'same_day' | 'this_week' | 'backlog';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
