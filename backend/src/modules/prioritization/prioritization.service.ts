import { Injectable, Logger } from '@nestjs/common';
import {
  UrgencyAnalysisInput,
  UrgencyAnalysisResult,
  CustomerTier,
  FeedbackSource,
} from '../../common/interfaces/feedback.interface';
import { openai } from '../../config/openai.config';

@Injectable()
export class PrioritizationService {
  private readonly logger = new Logger(PrioritizationService.name);

  /**
   * Calculate urgency score using OpenAI LLM
   * @param input Feedback data and context for analysis
   * @returns Urgency analysis result with score and reasoning
   */
  async calculateUrgency(
    input: UrgencyAnalysisInput,
  ): Promise<UrgencyAnalysisResult> {
    try {
      const prompt = this.buildUrgencyPrompt(input);

      this.logger.log('🤖 Calling OpenAI GPT-4 for urgency analysis...');
      const response = await openai().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a customer feedback triage expert. Analyze feedback and assign urgency scores based on multiple factors. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Low temperature for consistent scoring
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        this.logger.warn('OpenAI returned empty response, using fallback');
        return this.fallbackUrgencyCalculation(input);
      }

      const result = JSON.parse(content) as UrgencyAnalysisResult;

      // Validate the result
      if (
        typeof result.urgency_score !== 'number' ||
        result.urgency_score < 0 ||
        result.urgency_score > 100
      ) {
        this.logger.warn('Invalid urgency score from OpenAI, using fallback');
        return this.fallbackUrgencyCalculation(input);
      }

      this.logger.log(
        `✅ OpenAI returned urgency score: ${result.urgency_score}`,
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Error calculating urgency with OpenAI, using fallback', error.message);
      // Fallback to rule-based calculation
      return this.fallbackUrgencyCalculation(input);
    }
  }

  /**
   * Build the prompt for OpenAI urgency analysis
   * @param input Feedback context
   * @returns Formatted prompt string
   */
  private buildUrgencyPrompt(input: UrgencyAnalysisInput): string {
    const timeAgo = this.getTimeAgo(input.created_at);
    const customerTierLabel = input.customer_tier || 'unknown';
    const categoryLabel = input.category || 'uncategorized';

    // Extract relevant metadata
    let metadataInfo = '';
    if (input.metadata) {
      if ('nps_score' in input.metadata) {
        metadataInfo += `\n- NPS Score: ${input.metadata.nps_score}/10`;
      }
      if ('star_rating' in input.metadata) {
        metadataInfo += `\n- Star Rating: ${input.metadata.star_rating}/5`;
      }
      if ('channel' in input.metadata) {
        metadataInfo += `\n- Channel: ${input.metadata.channel}`;
      }
    }

    return `You are a customer feedback triage assistant. Analyze the following feedback and assign an urgency score (0-100) based on these criteria:

FEEDBACK DETAILS:
- Content: "${input.feedback_content}"
- Source: ${input.source}
- Customer Tier: ${customerTierLabel}
- Category: ${categoryLabel}
- Similar reports in last 30 days: ${input.frequency_count}${metadataInfo}
- Received: ${timeAgo}

SCORING GUIDELINES:
- Customer Value (30%): enterprise=30pts, pro=20pts, free=10pts, unknown=5pts
- Severity (25%):
  * Crashes, data loss, security issues: 25pts
  * Payment/checkout blocking issues: 20pts
  * Major feature broken: 15pts
  * UX degradation: 10pts
  * Cosmetic issues: 5pts
- Frequency (20%):
  * 10+ similar reports: 20pts
  * 5-9 reports: 15pts
  * 2-4 reports: 10pts
  * 1 report: 5pts
- Recency (15%):
  * Last 24h: 15pts
  * Last 3 days: 10pts
  * Last week: 5pts
  * Older: 2pts
- Business Impact (10%):
  * Revenue-affecting (payment, billing, checkout): 10pts
  * Onboarding-affecting (signup, login, first-time experience): 7pts
  * Core feature: 5pts
  * Nice-to-have: 2pts

Consider:
- Low NPS scores (0-6) or low star ratings (1-2) indicate higher urgency
- Multiple users reporting the same issue increases urgency
- Issues affecting enterprise customers are more urgent
- Blocking issues (cannot proceed) are more urgent than non-blocking

OUTPUT FORMAT (JSON only, no other text):
{
  "urgency_score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of why this score was assigned>",
  "recommended_action": "<immediate|same_day|this_week|backlog>"
}`;
  }

  /**
   * Fallback rule-based urgency calculation when OpenAI is unavailable
   * @param input Feedback context
   * @returns Urgency analysis result
   */
  private fallbackUrgencyCalculation(
    input: UrgencyAnalysisInput,
  ): UrgencyAnalysisResult {
    this.logger.warn('⚠️  Using fallback rule-based scoring (OpenAI unavailable)');
    let score = 0;
    const reasons: string[] = [];

    // Customer Value (30%)
    switch (input.customer_tier) {
      case CustomerTier.ENTERPRISE:
        score += 30;
        reasons.push('enterprise customer');
        break;
      case CustomerTier.PRO:
        score += 20;
        reasons.push('pro customer');
        break;
      case CustomerTier.FREE:
        score += 10;
        break;
      default:
        score += 5;
    }

    // Severity (25%) - based on keywords
    const content = input.feedback_content.toLowerCase();
    if (
      content.includes('crash') ||
      content.includes('data loss') ||
      content.includes('security')
    ) {
      score += 25;
      reasons.push('critical issue detected');
    } else if (
      content.includes('payment') ||
      content.includes('checkout') ||
      content.includes('billing')
    ) {
      score += 20;
      reasons.push('revenue-affecting issue');
    } else if (
      content.includes('broken') ||
      content.includes('not working') ||
      content.includes('error')
    ) {
      score += 15;
      reasons.push('major functionality issue');
    } else if (content.includes('slow') || content.includes('ux')) {
      score += 10;
    } else {
      score += 5;
    }

    // Frequency (20%)
    if (input.frequency_count >= 10) {
      score += 20;
      reasons.push(`${input.frequency_count} similar reports`);
    } else if (input.frequency_count >= 5) {
      score += 15;
      reasons.push(`${input.frequency_count} similar reports`);
    } else if (input.frequency_count >= 2) {
      score += 10;
      reasons.push(`${input.frequency_count} similar reports`);
    } else {
      score += 5;
    }

    // Recency (15%)
    const hoursSince = this.getHoursSince(input.created_at);
    if (hoursSince <= 24) {
      score += 15;
      reasons.push('recent feedback');
    } else if (hoursSince <= 72) {
      score += 10;
    } else if (hoursSince <= 168) {
      score += 5;
    } else {
      score += 2;
    }

    // Business Impact (10%)
    if (
      content.includes('payment') ||
      content.includes('billing') ||
      content.includes('checkout')
    ) {
      score += 10;
    } else if (
      content.includes('signup') ||
      content.includes('login') ||
      content.includes('onboarding')
    ) {
      score += 7;
    } else if (
      content.includes('dashboard') ||
      content.includes('core') ||
      content.includes('main')
    ) {
      score += 5;
    } else {
      score += 2;
    }

    // Determine recommended action
    let recommended_action: UrgencyAnalysisResult['recommended_action'];
    if (score >= 80) {
      recommended_action = 'immediate';
    } else if (score >= 60) {
      recommended_action = 'same_day';
    } else if (score >= 40) {
      recommended_action = 'this_week';
    } else {
      recommended_action = 'backlog';
    }

    const reasoning = reasons.length > 0
      ? `Urgency based on: ${reasons.join(', ')}.`
      : 'Standard urgency assessment based on available factors.';

    return {
      urgency_score: Math.min(100, Math.max(0, score)),
      reasoning,
      recommended_action,
    };
  }

  /**
   * Get human-readable time ago string
   * @param date Date to calculate from
   * @returns Time ago string
   */
  private getTimeAgo(date: Date): string {
    const hours = this.getHoursSince(date);

    if (hours < 1) {
      return 'less than 1 hour ago';
    } else if (hours < 24) {
      return `${Math.round(hours)} hours ago`;
    } else if (hours < 168) {
      return `${Math.round(hours / 24)} days ago`;
    } else {
      return `${Math.round(hours / 168)} weeks ago`;
    }
  }

  /**
   * Get hours since a date
   * @param date Date to calculate from
   * @returns Hours since date
   */
  private getHoursSince(date: Date): number {
    const now = new Date();
    return (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
  }
}
