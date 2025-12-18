import { Injectable } from '@nestjs/common';
import { Category, Sentiment } from '../../common/interfaces/feedback.interface';

@Injectable()
export class CategorizationService {
  /**
   * Categorizes feedback based on keyword matching
   * @param content The feedback content to categorize
   * @param categories Available categories with keywords
   * @returns The best matching category or null
   */
  categorize(content: string, categories: Category[]): Category | null {
    if (!content || !categories || categories.length === 0) {
      return null;
    }

    const normalizedContent = content.toLowerCase();
    let bestMatch: { category: Category; matchCount: number } | null = null;

    for (const category of categories) {
      let matchCount = 0;

      for (const keyword of category.keywords) {
        const normalizedKeyword = keyword.toLowerCase();

        // Count occurrences of this keyword in the content
        const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'gi');
        const matches = normalizedContent.match(regex);

        if (matches) {
          matchCount += matches.length;
        }
      }

      if (matchCount > 0) {
        if (!bestMatch || matchCount > bestMatch.matchCount) {
          bestMatch = { category, matchCount };
        }
      }
    }

    return bestMatch ? bestMatch.category : null;
  }

  /**
   * Determines sentiment based on content analysis
   * @param content The feedback content to analyze
   * @param categories Available categories (to check if it's praise or complaint)
   * @returns Sentiment type
   */
  determineSentiment(content: string, categoryType?: string): Sentiment {
    if (!content) {
      return Sentiment.NEUTRAL;
    }

    // If category already indicates sentiment, use that
    if (categoryType === 'praise') {
      return Sentiment.POSITIVE;
    }
    if (categoryType === 'complaint') {
      return Sentiment.NEGATIVE;
    }

    const normalizedContent = content.toLowerCase();

    // Positive indicators
    const positiveKeywords = [
      'love', 'great', 'amazing', 'awesome', 'excellent', 'perfect',
      'thank', 'fantastic', 'best', 'wonderful', 'incredible', 'outstanding',
      'happy', 'pleased', 'satisfied', 'appreciate', 'brilliant'
    ];

    // Negative indicators
    const negativeKeywords = [
      'hate', 'terrible', 'awful', 'worst', 'horrible', 'disappointed',
      'frustrated', 'angry', 'useless', 'waste', 'poor', 'bad',
      'annoying', 'broken', 'crash', 'error', 'fail', 'slow'
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const keyword of positiveKeywords) {
      if (normalizedContent.includes(keyword)) {
        positiveCount++;
      }
    }

    for (const keyword of negativeKeywords) {
      if (normalizedContent.includes(keyword)) {
        negativeCount++;
      }
    }

    if (positiveCount > negativeCount && positiveCount > 0) {
      return Sentiment.POSITIVE;
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      return Sentiment.NEGATIVE;
    }

    return Sentiment.NEUTRAL;
  }

  /**
   * Extracts potential tags from feedback content
   * @param content The feedback content
   * @returns Array of suggested tags
   */
  extractTags(content: string, metadata?: any): string[] {
    const tags: Set<string> = new Set();
    const normalizedContent = content.toLowerCase();

    // Feature area tags
    const featureAreas = [
      'checkout', 'payment', 'billing', 'auth', 'authentication', 'login',
      'signup', 'dashboard', 'profile', 'settings', 'notification', 'email',
      'mobile', 'ios', 'android', 'api', 'integration', 'export', 'import',
      'search', 'filter', 'upload', 'download', 'performance', 'speed'
    ];

    for (const area of featureAreas) {
      if (normalizedContent.includes(area)) {
        tags.add(area);
      }
    }

    // Add source-specific tags from metadata
    if (metadata) {
      if (metadata.channel) {
        tags.add(`channel:${metadata.channel}`);
      }
      if (metadata.store) {
        tags.add(`store:${metadata.store}`);
      }
      if (metadata.platform) {
        tags.add(`platform:${metadata.platform}`);
      }
      if (metadata.app_version) {
        tags.add(`version:${metadata.app_version}`);
      }
    }

    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  /**
   * Detects if feedback indicates a critical issue
   * @param content The feedback content
   * @returns True if critical keywords detected
   */
  isCritical(content: string): boolean {
    const normalizedContent = content.toLowerCase();
    const criticalKeywords = [
      'crash', 'down', 'not working', 'broken', 'can\'t', 'cannot',
      'error', 'fail', 'unable', 'doesn\'t work', 'stopped working',
      'data loss', 'lost data', 'security', 'breach', 'hack',
      'payment fail', 'charge', 'refund'
    ];

    return criticalKeywords.some(keyword => normalizedContent.includes(keyword));
  }

  /**
   * Escapes special regex characters in a string
   * @param str String to escape
   * @returns Escaped string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
