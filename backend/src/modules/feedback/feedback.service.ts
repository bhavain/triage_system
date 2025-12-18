import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseConfig } from '../../config/supabase.config';
import {
  Feedback,
  Customer,
  Category,
  CustomerTier,
  FeedbackStatus,
  Sentiment,
  PaginationMeta,
  ApiResponse,
  UrgencyAnalysisResult,
  FeedbackSource,
} from '../../common/interfaces/feedback.interface';
import { PrioritizationService } from '../prioritization/prioritization.service';
import { CategorizationService } from '../prioritization/categorization.service';
import {
  CreateFeedbackItemDto,
  SupportTicketDto,
  NPSSurveyDto,
  AppStoreReviewDto,
  SocialMentionDto,
} from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly supabase = SupabaseConfig.getInstance();

  constructor(
    private readonly prioritizationService: PrioritizationService,
    private readonly categorizationService: CategorizationService,
  ) {}

  /**
   * Create multiple feedback items in batch using staged pipeline
   * This is optimized for production-level batch ingestion
   * Accepts items in different payload shapes and normalizes them internally
   */
  async createBatch(items: any[]): Promise<{
    success: boolean;
    ingested_count: number;
    failed_count: number;
    feedback_ids: string[];
    errors?: Array<{ index: number; error: string }>;
  }> {
    this.logger.log(`🚀 Starting batch ingestion of ${items.length} items`);
    const startTime = Date.now();

    const feedback_ids: string[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    const processedItems: Array<{
      index: number;
      dto: CreateFeedbackItemDto;
      customer: Customer | null;
      category: Category | null;
      sentiment: Sentiment;
      frequencyCount: number;
      tags: string[];
    }> = [];

    try {
      // STAGE 0: Normalize payloads (convert different shapes to internal format)
      this.logger.log('🔄 Stage 0: Normalizing payloads from different sources');
      const normalizedItems: CreateFeedbackItemDto[] = [];
      for (let i = 0; i < items.length; i++) {
        try {
          const normalized = this.normalizeFeedbackPayload(items[i]);
          normalizedItems.push(normalized);
        } catch (error) {
          this.logger.error(`Error normalizing item at index ${i}`, error);
          errors.push({ index: i, error: `Normalization failed: ${error.message}` });
        }
      }

      // STAGE 1: Get all categories once
      this.logger.log('📊 Stage 1: Fetching categories');
      const categories = await this.getAllCategories();

      // STAGE 2: Process each item - customer, categorization, sentiment, frequency
      this.logger.log('👥 Stage 2: Processing customers, categorization, and frequency');
      for (let i = 0; i < normalizedItems.length; i++) {
        try {
          const dto = normalizedItems[i];

          // Get or create customer
          let customer: Customer | null = null;
          if (dto.customer_email) {
            customer = await this.getOrCreateCustomer(
              dto.customer_email,
              dto.customer_tier || CustomerTier.FREE,
              dto.customer_company,
            );
          }

          // Categorize
          const category = this.categorizationService.categorize(
            dto.content,
            categories,
          );

          // Determine sentiment
          const sentiment = this.categorizationService.determineSentiment(
            dto.content,
            category?.type,
          );

          // Check frequency
          const frequencyCount = await this.getSimilarFeedbackCount(
            dto.content,
            category?.id,
          );

          // Extract tags
          const tags = this.categorizationService.extractTags(
            dto.content,
            dto.metadata,
          );

          processedItems.push({
            index: i,
            dto,
            customer,
            category,
            sentiment,
            frequencyCount,
            tags,
          });
        } catch (error) {
          this.logger.error(`Error processing item at index ${i}`, error);
          errors.push({ index: i, error: error.message });
        }
      }

      // STAGE 3: Calculate urgency scores in batches of 10
      this.logger.log(`🤖 Stage 3: Calculating urgency scores (batches of 10)`);
      const BATCH_SIZE = 10;
      const urgencyResults: Map<number, UrgencyAnalysisResult> = new Map();

      for (let i = 0; i < processedItems.length; i += BATCH_SIZE) {
        const batch = processedItems.slice(i, Math.min(i + BATCH_SIZE, processedItems.length));

        try {
          const batchResults = await this.prioritizationService.calculateUrgencyBatch(
            batch.map(item => ({
              feedback_content: item.dto.content,
              customer_tier: item.customer?.tier,
              category: item.category?.name,
              frequency_count: item.frequencyCount,
              created_at: new Date(),
              source: item.dto.source || FeedbackSource.SUPPORT, // Fallback to SUPPORT if not set
              metadata: item.dto.metadata || {},
            }))
          );

          // Map results back to original indices
          batchResults.forEach((result, batchIndex) => {
            urgencyResults.set(batch[batchIndex].index, result);
          });
        } catch (error) {
          this.logger.error(`Error calculating urgency for batch ${i / BATCH_SIZE}`, error);
          // Add errors for all items in this batch
          batch.forEach(item => {
            errors.push({ index: item.index, error: `Urgency calculation failed: ${error.message}` });
          });
        }
      }

      // STAGE 4: Batch insert feedback into database
      this.logger.log('💾 Stage 4: Batch inserting feedback');
      const feedbackToInsert = processedItems
        .filter(item => urgencyResults.has(item.index))
        .map(item => {
          const urgency = urgencyResults.get(item.index)!;
          return {
            customer_id: item.customer?.id || null,
            category_id: item.category?.id || null,
            source: item.dto.source,
            content: item.dto.content,
            urgency_score: urgency.urgency_score,
            urgency_reasoning: urgency.reasoning,
            sentiment: item.sentiment,
            status: FeedbackStatus.NEW,
            frequency_count: item.frequencyCount,
            metadata: item.dto.metadata || {},
          };
        });

      if (feedbackToInsert.length > 0) {
        const { data: feedbackData, error: insertError } = await this.supabase
          .from('feedback')
          .insert(feedbackToInsert)
          .select();

        if (insertError) {
          this.logger.error('Error batch inserting feedback', insertError);
          throw new Error(`Failed to batch insert feedback: ${insertError.message}`);
        }

        if (feedbackData) {
          feedback_ids.push(...feedbackData.map(f => f.id));

          // STAGE 5: Batch insert tags
          this.logger.log('🏷️  Stage 5: Batch inserting tags');
          const allTags: Array<{ feedback_id: string; tag: string }> = [];

          feedbackData.forEach((feedback, idx) => {
            const itemIndex = processedItems.findIndex(
              (item, i) => urgencyResults.has(item.index) && i === idx
            );

            if (itemIndex !== -1) {
              const tags = processedItems[itemIndex].tags;
              tags.forEach(tag => {
                allTags.push({ feedback_id: feedback.id, tag });
              });
            }
          });

          if (allTags.length > 0) {
            const { error: tagsError } = await this.supabase
              .from('feedback_tags')
              .insert(allTags);

            if (tagsError) {
              this.logger.warn('Error batch inserting tags', tagsError);
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Batch ingestion complete: ${feedback_ids.length} succeeded, ${errors.length} failed (${duration}ms)`
      );

      return {
        success: true,
        ingested_count: feedback_ids.length,
        failed_count: errors.length,
        feedback_ids,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error('❌ Critical error in batch ingestion', error);
      throw error;
    }
  }

  /**
   * Create a single feedback item
   */
  async createOne(dto: CreateFeedbackItemDto): Promise<Feedback> {
    // Step 1: Get or create customer
    let customer: Customer | null = null;
    if (dto.customer_email) {
      customer = await this.getOrCreateCustomer(
        dto.customer_email,
        dto.customer_tier || CustomerTier.FREE,
        dto.customer_company,
      );
    }

    // Step 2: Get all categories and categorize the feedback
    const categories = await this.getAllCategories();
    const category = this.categorizationService.categorize(
      dto.content,
      categories,
    );

    // Step 3: Determine sentiment
    const sentiment = this.categorizationService.determineSentiment(
      dto.content,
      category?.type,
    );

    // Step 4: Check for similar feedback (frequency detection)
    const frequencyCount = await this.getSimilarFeedbackCount(
      dto.content,
      category?.id,
    );

    // Step 5: Calculate urgency score using LLM
    const urgencyAnalysis = await this.prioritizationService.calculateUrgency({
      feedback_content: dto.content,
      customer_tier: customer?.tier,
      category: category?.name,
      frequency_count: frequencyCount,
      created_at: new Date(),
      source: dto.source || FeedbackSource.SUPPORT, // Fallback to SUPPORT if not set
      metadata: dto.metadata || {},
    });

    // Step 6: Extract tags
    const tags = this.categorizationService.extractTags(
      dto.content,
      dto.metadata,
    );

    // Step 7: Insert feedback into database
    const { data: feedbackData, error } = await this.supabase
      .from('feedback')
      .insert({
        customer_id: customer?.id || null,
        category_id: category?.id || null,
        source: dto.source,
        content: dto.content,
        urgency_score: urgencyAnalysis.urgency_score,
        urgency_reasoning: urgencyAnalysis.reasoning,
        sentiment,
        status: FeedbackStatus.NEW,
        frequency_count: frequencyCount,
        metadata: dto.metadata || {},
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error inserting feedback', error);
      throw new Error(`Failed to create feedback: ${error.message}`);
    }

    // Step 8: Insert tags
    if (tags.length > 0) {
      await this.insertTags(feedbackData.id, tags);
    }

    this.logger.log(`Created feedback with ID: ${feedbackData.id}, urgency: ${urgencyAnalysis.urgency_score}`);

    return {
      ...feedbackData,
      customer,
      category,
      tags,
    };
  }

  /**
   * Find feedback with filters and pagination
   */
  async findAll(query: QueryFeedbackDto): Promise<ApiResponse<Feedback[]>> {
    let queryBuilder = this.supabase
      .from('feedback')
      .select('*, customer:customers(*), category:categories(*)', {
        count: 'exact',
      });

    // Apply filters
    if (query.source) {
      queryBuilder = queryBuilder.eq('source', query.source);
    }
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }
    if (query.sentiment) {
      queryBuilder = queryBuilder.eq('sentiment', query.sentiment);
    }
    if (query.min_urgency !== undefined) {
      queryBuilder = queryBuilder.gte('urgency_score', query.min_urgency);
    }
    if (query.max_urgency !== undefined) {
      queryBuilder = queryBuilder.lte('urgency_score', query.max_urgency);
    }
    if (query.date_from) {
      queryBuilder = queryBuilder.gte('created_at', query.date_from);
    }
    if (query.date_to) {
      queryBuilder = queryBuilder.lte('created_at', query.date_to);
    }
    if (query.search) {
      queryBuilder = queryBuilder.ilike('content', `%${query.search}%`);
    }

    // Apply customer tier filter through join
    if (query.customer_tier) {
      queryBuilder = queryBuilder.eq('customer.tier', query.customer_tier);
    }

    // Apply category filter through join
    if (query.category) {
      queryBuilder = queryBuilder.eq('category.name', query.category);
    }

    // Apply sorting
    const sortBy = query.sort_by || 'created_at';
    const sortOrder = query.sort_order || 'desc';
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      this.logger.error('Error querying feedback', error);
      throw new Error(`Failed to query feedback: ${error.message}`);
    }

    // Fetch tags for each feedback
    const feedbackWithTags = await Promise.all(
      (data || []).map(async (feedback) => {
        const tags = await this.getTags(feedback.id);
        return { ...feedback, tags };
      }),
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: feedbackWithTags as Feedback[],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Find single feedback by ID
   */
  async findOne(id: string): Promise<Feedback> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*, customer:customers(*), category:categories(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Fetch tags
    const tags = await this.getTags(id);

    // Fetch similar feedback
    const similarFeedback = await this.getSimilarFeedback(
      data.content,
      data.category_id,
      id,
    );

    return {
      ...data,
      tags,
      similar_feedback: similarFeedback,
    } as Feedback;
  }

  /**
   * Update feedback
   */
  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    const { data, error } = await this.supabase
      .from('feedback')
      .update({
        ...(dto.status && { status: dto.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, customer:customers(*), category:categories(*)')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    const tags = await this.getTags(id);

    return { ...data, tags } as Feedback;
  }

  /**
   * Get or create customer
   */
  private async getOrCreateCustomer(
    email: string,
    tier: CustomerTier,
    companyName?: string,
  ): Promise<Customer> {
    // Try to find existing customer
    const { data: existing } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      return existing as Customer;
    }

    // Create new customer
    const { data: newCustomer, error } = await this.supabase
      .from('customers')
      .insert({
        email,
        tier,
        company_name: companyName,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating customer', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return newCustomer as Customer;
  }

  /**
   * Get all categories
   */
  private async getAllCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*');

    if (error) {
      this.logger.error('Error fetching categories', error);
      return [];
    }

    return (data || []) as Category[];
  }

  /**
   * Get similar feedback count (last 30 days)
   */
  private async getSimilarFeedbackCount(
    content: string,
    categoryId?: number,
  ): Promise<number> {
    try {
      // Extract keywords for matching
      const keywords = content
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 3); // Use top 3 keywords

      if (keywords.length === 0) {
        return 1;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // For each keyword, count matches and use the highest count
      let maxCount = 0;

      for (const keyword of keywords) {
        let query = this.supabase
          .from('feedback')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())
          .ilike('content', `%${keyword}%`);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { count, error } = await query;

        if (!error && count && count > maxCount) {
          maxCount = count;
        }
      }

      return maxCount + 1; // +1 for the current feedback
    } catch (error) {
      this.logger.warn('Error counting similar feedback', error);
      return 1;
    }
  }

  /**
   * Get similar feedback items
   */
  private async getSimilarFeedback(
    content: string,
    categoryId?: number,
    excludeId?: string,
    limit: number = 5,
  ): Promise<any[]> {
    try {
      const keywords = content
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 3);

      if (keywords.length === 0) {
        return [];
      }

      // Use the first keyword to find similar items
      let query = this.supabase
        .from('feedback')
        .select('id, content, created_at, customer:customers(tier)')
        .ilike('content', `%${keywords[0]}%`);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        this.logger.warn('Error fetching similar feedback', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.warn('Error fetching similar feedback', error);
      return [];
    }
  }

  /**
   * Insert tags for feedback
   */
  private async insertTags(feedbackId: string, tags: string[]): Promise<void> {
    const tagInserts = tags.map((tag) => ({
      feedback_id: feedbackId,
      tag,
    }));

    const { error } = await this.supabase
      .from('feedback_tags')
      .insert(tagInserts);

    if (error) {
      this.logger.warn('Error inserting tags', error);
    }
  }

  /**
   * Get tags for feedback
   */
  private async getTags(feedbackId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('feedback_tags')
      .select('tag')
      .eq('feedback_id', feedbackId);

    if (error) {
      this.logger.warn('Error fetching tags', error);
      return [];
    }

    return (data || []).map((item) => item.tag);
  }

  /**
   * Normalize source-specific payload to internal CreateFeedbackItemDto
   * This accepts different payload shapes based on the source and normalizes them
   */
  normalizeFeedbackPayload(
    payload: any,
  ): CreateFeedbackItemDto {
    // If it's already in the standard format with 'source' field, return as-is
    if (payload.source) {
      return payload as CreateFeedbackItemDto;
    }

    // Detect the source based on unique fields and normalize
    if ('ticket_id' in payload && 'channel' in payload) {
      // Support Ticket
      const ticket = payload as SupportTicketDto;
      return {
        source: FeedbackSource.SUPPORT,
        content: ticket.content,
        customer_email: ticket.customer_email,
        customer_tier: ticket.customer_tier,
        customer_company: ticket.customer_company,
        metadata: {
          ticket_id: ticket.ticket_id,
          channel: ticket.channel,
          assigned_agent: ticket.assigned_agent,
          resolution_time: ticket.resolution_time,
        },
      };
    }

    if ('nps_score' in payload) {
      // NPS Survey
      const nps = payload as NPSSurveyDto;
      return {
        source: FeedbackSource.NPS,
        content: nps.content,
        customer_email: nps.customer_email,
        customer_tier: nps.customer_tier,
        customer_company: nps.customer_company,
        metadata: {
          nps_score: nps.nps_score,
          survey_campaign: nps.survey_campaign,
          response_date: nps.response_date,
        },
      };
    }

    if ('store' in payload && 'star_rating' in payload && 'app_version' in payload) {
      // App Store Review
      const review = payload as AppStoreReviewDto;
      return {
        source: FeedbackSource.APPSTORE,
        content: review.content,
        customer_email: review.customer_email,
        customer_tier: review.customer_tier,
        metadata: {
          store: review.store,
          app_version: review.app_version,
          star_rating: review.star_rating,
          reviewer_username: review.reviewer_username,
        },
      };
    }

    if ('platform' in payload && 'author_handle' in payload) {
      // Social Mention
      const social = payload as SocialMentionDto;
      return {
        source: FeedbackSource.SOCIAL,
        content: social.content,
        customer_email: social.customer_email,
        customer_tier: social.customer_tier,
        metadata: {
          platform: social.platform,
          author_handle: social.author_handle,
          engagement_count: social.engagement_count,
          post_url: social.post_url,
        },
      };
    }

    // Fallback: if we can't detect the source, throw an error
    throw new Error(
      'Unable to determine feedback source from payload. Please include a "source" field or use source-specific fields.'
    );
  }
}
