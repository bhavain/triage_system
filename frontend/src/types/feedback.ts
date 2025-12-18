export type FeedbackSource = 'support' | 'nps' | 'appstore' | 'social';
export type FeedbackStatus = 'new' | 'reviewed' | 'assigned' | 'resolved';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type CustomerTier = 'free' | 'pro' | 'enterprise';
export type CategoryType = 'bug' | 'feature' | 'complaint' | 'praise' | 'question';

export interface Customer {
  id: string;
  email: string;
  tier: CustomerTier;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  keywords: string[];
  description?: string;
  created_at: string;
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
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  customer?: Customer;
  category?: Category;
  tags?: string[];
  similar_feedback?: SimilarFeedback[];
}

export interface SimilarFeedback {
  id: string;
  content: string;
  created_at: string;
  customer_tier?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface FeedbackListResponse {
  data: Feedback[];
  pagination: PaginationMeta;
}

export interface UrgentQueueSummary {
  total_urgent: number;
  critical_count: number;
  high_count: number;
  by_category: Record<string, number>;
}

export interface UrgentQueueResponse {
  urgent_items: Array<{
    id: string;
    content: string;
    urgency_score: number;
    urgency_reasoning: string;
    category: string | Category;
    customer_tier: string;
    frequency_count: number;
    created_at: string;
  }>;
  summary: UrgentQueueSummary;
}

export interface TrendsDayData {
  date: string;
  count: number;
}

export interface TrendsCategoryData {
  category: string;
  count: number;
  percent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendsSourceData {
  source: string;
  count: number;
  percent: number;
}

export interface TrendsResponse {
  period: {
    start: string;
    end: string;
  };
  volume: {
    total: number;
    change_percent: number;
    by_day: TrendsDayData[];
  };
  by_category: TrendsCategoryData[];
  by_source: TrendsSourceData[];
  top_issues: Array<{
    category: string;
    count: number;
    summary: string;
  }>;
}

export interface SummaryMetrics {
  total_feedback: number;
  nps_score: number;
  nps_trend: 'up' | 'down' | 'stable';
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  response_rate: number;
  avg_resolution_time: number;
}

export interface SummaryResponse {
  period: {
    start: string;
    end: string;
  };
  metrics: SummaryMetrics;
  top_categories: Array<{
    category: string;
    count: number;
    change_percent: number;
  }>;
  critical_issues: Array<{
    issue: string;
    urgency_score: number;
    affected_customers: number;
  }>;
  highlights: {
    most_requested_feature: string;
    biggest_pain_point: string;
    praise_summary: string;
  };
}
