import type {
  Feedback,
  FeedbackListResponse,
  UrgentQueueResponse,
  TrendsResponse,
  SummaryResponse,
} from '../types/feedback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Feedback endpoints
  async getFeedbackList(params?: {
    source?: string;
    category?: string;
    customer_tier?: string;
    status?: string;
    sentiment?: string;
    min_urgency?: number;
    max_urgency?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }): Promise<FeedbackListResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return this.fetch<FeedbackListResponse>(
      `/api/feedback${queryString ? `?${queryString}` : ''}`
    );
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    return this.fetch<Feedback>(`/api/feedback/${id}`);
  }

  async updateFeedback(
    id: string,
    data: {
      status?: string;
      assigned_to?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; feedback: Feedback }> {
    return this.fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Insights endpoints
  async getUrgentQueue(params?: {
    min_urgency?: number;
    hours?: number;
  }): Promise<UrgentQueueResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return this.fetch<UrgentQueueResponse>(
      `/api/insights/urgent${queryString ? `?${queryString}` : ''}`
    );
  }

  async getTrends(params?: {
    period?: 'day' | 'week' | 'month';
    group_by?: 'category' | 'source' | 'customer_tier';
  }): Promise<TrendsResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return this.fetch<TrendsResponse>(
      `/api/insights/trends${queryString ? `?${queryString}` : ''}`
    );
  }

  async getSummary(params?: {
    period?: 'week' | 'month' | 'quarter';
  }): Promise<SummaryResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return this.fetch<SummaryResponse>(
      `/api/insights/summary${queryString ? `?${queryString}` : ''}`
    );
  }
}

export const apiService = new ApiService();
