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
} from '../../common/interfaces/feedback.interface';
import { PrioritizationService } from '../prioritization/prioritization.service';
import { CategorizationService } from '../prioritization/categorization.service';
import { CreateFeedbackItemDto } from './dto/create-feedback.dto';
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
   * Create multiple feedback items in batch
   */
  async createBatch(items: CreateFeedbackItemDto[]): Promise<{
    success: boolean;
    ingested_count: number;
    failed_count: number;
    feedback_ids: string[];
    errors?: Array<{ index: number; error: string }>;
  }> {
    const feedback_ids: string[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const feedback = await this.createOne(items[i]);
        feedback_ids.push(feedback.id);
      } catch (error) {
        this.logger.error(`Error creating feedback at index ${i}`, error);
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      success: true,
      ingested_count: feedback_ids.length,
      failed_count: errors.length,
      feedback_ids,
      errors: errors.length > 0 ? errors : undefined,
    };
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
      source: dto.source,
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
      queryBuilder = queryBuilder.textSearch('content', query.search);
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
    // Extract keywords for matching
    const keywords = content
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 5);

    if (keywords.length === 0) {
      return 1;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = this.supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Use text search for keyword matching
    const searchQuery = keywords.join(' | ');
    query = query.textSearch('content', searchQuery);

    const { count, error } = await query;

    if (error) {
      this.logger.warn('Error counting similar feedback', error);
      return 1;
    }

    return (count || 0) + 1; // +1 for the current feedback
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
    const keywords = content
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 5);

    if (keywords.length === 0) {
      return [];
    }

    let query = this.supabase
      .from('feedback')
      .select('id, content, created_at, customer:customers(tier)');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const searchQuery = keywords.join(' | ');
    query = query.textSearch('content', searchQuery).limit(limit);

    const { data, error } = await query;

    if (error) {
      this.logger.warn('Error fetching similar feedback', error);
      return [];
    }

    return data || [];
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
}
