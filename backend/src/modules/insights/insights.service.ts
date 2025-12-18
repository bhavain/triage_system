import { Injectable, Logger } from '@nestjs/common';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  private readonly supabase = SupabaseConfig.getInstance();

  /**
   * Get urgent feedback items
   */
  async getUrgentQueue(minUrgency: number = 70, hours: number = 24) {
    const lookbackDate = new Date();
    lookbackDate.setHours(lookbackDate.getHours() - hours);

    const { data, error } = await this.supabase
      .from('feedback')
      .select('id, content, urgency_score, urgency_reasoning, category:categories(name), customer:customers(tier), frequency_count, created_at')
      .gte('urgency_score', minUrgency)
      .gte('created_at', lookbackDate.toISOString())
      .order('urgency_score', { ascending: false })
      .limit(50);

    if (error) {
      this.logger.error('Error fetching urgent queue', error);
      throw new Error(`Failed to fetch urgent queue: ${error.message}`);
    }

    // Calculate summary stats
    const criticalCount = (data || []).filter(item => item.urgency_score >= 90).length;
    const highCount = (data || []).filter(item => item.urgency_score >= 70 && item.urgency_score < 90).length;

    const byCategory = (data || []).reduce((acc, item) => {
      const category = Array.isArray(item.category) ? item.category[0] : item.category;
      const categoryName = category?.name || 'uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      urgent_items: data || [],
      summary: {
        total_urgent: (data || []).length,
        critical_count: criticalCount,
        high_count: highCount,
        by_category: byCategory,
      },
    };
  }

  /**
   * Get trends analysis
   */
  async getTrends(period: 'day' | 'week' | 'month' = 'week', groupBy: 'category' | 'source' | 'customer_tier' = 'category') {
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
        break;
    }

    // Get current period data
    const { data: currentData, error: currentError } = await this.supabase
      .from('feedback')
      .select('id, source, category:categories(name, type), customer:customers(tier), created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (currentError) {
      this.logger.error('Error fetching current trends', currentError);
      throw new Error(`Failed to fetch trends: ${currentError.message}`);
    }

    // Get previous period data for comparison
    const { data: previousData, error: previousError } = await this.supabase
      .from('feedback')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    if (previousError) {
      this.logger.warn('Error fetching previous trends', previousError);
    }

    const currentTotal = (currentData || []).length;
    const previousTotal = (previousData || []).length;
    const changePercent = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Group by day
    const byDay = this.groupByDay(currentData || [], startDate, now);

    // Group by category
    const byCategory = this.groupByCategory(currentData || []);

    // Group by source
    const bySource = this.groupBySource(currentData || []);

    // Find top issues (most frequent categories)
    const topIssues = byCategory
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        category: item.category,
        count: item.count,
        summary: `${item.count} reports in ${item.category}`,
      }));

    return {
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      volume: {
        total: currentTotal,
        change_percent: Math.round(changePercent * 10) / 10,
        by_day: byDay,
      },
      by_category: byCategory,
      by_source: bySource,
      top_issues: topIssues,
    };
  }

  /**
   * Get executive summary
   */
  async getSummary(period: 'week' | 'month' | 'quarter' = 'month') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Get all feedback in period
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*, category:categories(name, type), customer:customers(tier)')
      .gte('created_at', startDate.toISOString());

    if (error) {
      this.logger.error('Error fetching summary', error);
      throw new Error(`Failed to fetch summary: ${error.message}`);
    }

    const feedback = data || [];
    const total = feedback.length;

    // Calculate NPS score
    const npsData = feedback.filter(f => f.metadata?.nps_score !== undefined);
    const npsScore = this.calculateNPS(npsData.map(f => f.metadata.nps_score));

    // Calculate sentiment distribution
    const sentimentDist = {
      positive: feedback.filter(f => f.sentiment === 'positive').length,
      neutral: feedback.filter(f => f.sentiment === 'neutral').length,
      negative: feedback.filter(f => f.sentiment === 'negative').length,
    };

    // Calculate response rate (reviewed feedback)
    const reviewedCount = feedback.filter(f => f.status !== 'new').length;
    const responseRate = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;

    // Top categories
    const categoryCounts = feedback.reduce((acc, f) => {
      const cat = f.category?.name || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count: count as number, change_percent: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Critical issues
    const criticalIssues = feedback
      .filter(f => f.urgency_score >= 80)
      .sort((a, b) => b.urgency_score - a.urgency_score)
      .slice(0, 5)
      .map(f => ({
        issue: f.content.substring(0, 100) + '...',
        urgency_score: f.urgency_score,
        affected_customers: f.frequency_count,
      }));

    // Highlights
    const featureRequests = feedback.filter(f => f.category?.type === 'feature');
    const mostRequestedFeature = this.getMostCommonTheme(featureRequests.map(f => f.content));

    const complaints = feedback.filter(f => f.category?.type === 'complaint');
    const biggestPainPoint = this.getMostCommonTheme(complaints.map(f => f.content));

    const praise = feedback.filter(f => f.category?.type === 'praise');
    const praiseSummary = praise.length > 0 ? `${praise.length} positive feedback items received` : 'No praise this period';

    return {
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      metrics: {
        total_feedback: total,
        nps_score: npsScore,
        nps_trend: 'stable', // Would need historical data
        sentiment_distribution: sentimentDist,
        response_rate: responseRate,
        avg_resolution_time: 0, // Would need resolution timestamps
      },
      top_categories: topCategories,
      critical_issues: criticalIssues,
      highlights: {
        most_requested_feature: mostRequestedFeature || 'None identified',
        biggest_pain_point: biggestPainPoint || 'None identified',
        praise_summary: praiseSummary,
      },
    };
  }

  /**
   * Calculate NPS score from array of scores (0-10)
   */
  private calculateNPS(scores: number[]): number {
    if (scores.length === 0) return 0;

    const promoters = scores.filter(s => s >= 9).length;
    const detractors = scores.filter(s => s <= 6).length;

    return Math.round(((promoters - detractors) / scores.length) * 100);
  }

  /**
   * Group feedback by day
   */
  private groupByDay(data: any[], startDate: Date, endDate: Date): any[] {
    const dayMap = new Map<string, number>();

    // Initialize all days with 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dayMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count feedback per day
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Group feedback by category
   */
  private groupByCategory(data: any[]): any[] {
    const categoryMap = new Map<string, number>();

    data.forEach(item => {
      const category = item.category?.name || 'uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const total = data.length;

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        trend: 'stable', // Would need historical data
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group feedback by source
   */
  private groupBySource(data: any[]): any[] {
    const sourceMap = new Map<string, number>();

    data.forEach(item => {
      sourceMap.set(item.source, (sourceMap.get(item.source) || 0) + 1);
    });

    const total = data.length;

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Extract most common theme from feedback content
   */
  private getMostCommonTheme(contents: string[]): string | null {
    if (contents.length === 0) return null;

    // Extract common keywords (very simple approach)
    const wordFreq = new Map<string, number>();

    contents.forEach(content => {
      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 4);

      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
    });

    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    return sortedWords.length > 0 ? sortedWords.join(', ') : null;
  }
}
