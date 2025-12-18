import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Category keywords
const CATEGORY_KEYWORDS: Record<string, { id: number; keywords: string[] }> = {
  'Bug Report': { id: 1, keywords: ['crash', 'error', 'broken', 'not working', 'bug', 'issue', 'fails', 'freezes', 'stuck', 'glitch', '500', '404', 'problem', 'wrong'] },
  'Feature Request': { id: 2, keywords: ['wish', 'would be nice', 'should add', 'feature request', 'suggestion', 'can you', 'please add', 'missing', 'need', 'want', 'could you'] },
  'Complaint': { id: 3, keywords: ['frustrated', 'angry', 'terrible', 'worst', 'disappointed', 'useless', 'waste', 'slow', 'poor', 'bad experience', 'unhappy', 'horrible'] },
  'Praise': { id: 4, keywords: ['love', 'great', 'amazing', 'awesome', 'excellent', 'perfect', 'thank you', 'fantastic', 'best', 'wonderful', 'incredible', 'outstanding'] },
  'Question': { id: 5, keywords: ['how do i', 'how to', 'can i', 'is it possible', 'where is', 'what is', '?', 'help', 'confused', 'understand', 'explain'] },
};

function categorizeContent(content: string): number | null {
  const lowerContent = content.toLowerCase();

  for (const [categoryName, { id, keywords }] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        return id;
      }
    }
  }

  return null; // uncategorized
}

function determineSentiment(content: string): string {
  const lowerContent = content.toLowerCase();

  const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excellent', 'perfect', 'thank', 'fantastic', 'best', 'wonderful'];
  const negativeWords = ['crash', 'error', 'broken', 'frustrated', 'angry', 'terrible', 'worst', 'disappointed', 'bad', 'horrible'];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerContent.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (lowerContent.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

async function calculateUrgency(feedback: any, category: string | null, frequencyCount: number): Promise<{ score: number; reasoning: string }> {
  try {
    const prompt = `You are a customer feedback triage assistant. Analyze the following feedback and assign an urgency score (0-100) based on these criteria:

FEEDBACK DETAILS:
- Content: "${feedback.content}"
- Source: ${feedback.source}
- Customer Tier: ${feedback.customer_tier || 'unknown'}
- Category: ${category || 'uncategorized'}
- Similar reports in last 30 days: ${frequencyCount}
- Received: recently

SCORING GUIDELINES:
- Customer Value (30%): enterprise=30pts, pro=20pts, free=10pts
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
- Business Impact (10%):
  * Revenue-affecting: 10pts
  * Onboarding-affecting: 7pts
  * Core feature: 5pts
  * Nice-to-have: 2pts

OUTPUT FORMAT (JSON):
{
  "urgency_score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation>"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a customer feedback triage expert. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      score: Math.min(100, Math.max(0, result.urgency_score || 50)),
      reasoning: result.reasoning || 'Urgency analysis based on feedback content and context.',
    };
  } catch (error) {
    console.error('  ⚠️  OpenAI API error, using fallback scoring:', error.message);

    // Fallback urgency calculation
    let score = 50;
    if (feedback.customer_tier === 'enterprise') score += 20;
    else if (feedback.customer_tier === 'pro') score += 10;

    if (category === 'Bug Report') score += 15;
    if (frequencyCount > 1) score += 10;

    return {
      score: Math.min(100, score),
      reasoning: 'Urgency calculated using rule-based scoring due to AI service unavailability.',
    };
  }
}

async function processAllFeedback() {
  console.log('🤖 Fetching all feedback to process...\n');

  // Get all feedback
  const { data: feedbackItems, error } = await supabase
    .from('feedback')
    .select(`
      id,
      content,
      source,
      customer_id,
      customers (tier)
    `)
    .is('urgency_score', null);

  if (error) {
    throw error;
  }

  console.log(`📝 Found ${feedbackItems.length} items to process\n`);
  console.log('⏱️  Processing with AI (this will take several minutes)...\n');

  let processed = 0;
  const errors: any[] = [];

  for (const item of feedbackItems) {
    try {
      // Categorize
      const categoryId = categorizeContent(item.content);
      const categoryName = categoryId ? Object.keys(CATEGORY_KEYWORDS).find(k => CATEGORY_KEYWORDS[k].id === categoryId) : null;

      // Determine sentiment
      const sentiment = determineSentiment(item.content);

      // Calculate frequency (simplified)
      const frequencyCount = 1; // In real system, this would query for similar feedback

      // Calculate urgency with AI
      const customerTier = (item.customers as any)?.[0]?.tier || (item.customers as any)?.tier || null;
      const urgencyResult = await calculateUrgency(
        {
          ...item,
          customer_tier: customerTier
        },
        categoryName || null,
        frequencyCount
      );

      // Update feedback
      const { error: updateError } = await supabase
        .from('feedback')
        .update({
          category_id: categoryId,
          sentiment: sentiment,
          urgency_score: urgencyResult.score,
          urgency_reasoning: urgencyResult.reasoning,
          frequency_count: frequencyCount,
        })
        .eq('id', item.id);

      if (updateError) {
        throw updateError;
      }

      processed++;

      if (processed % 5 === 0) {
        console.log(`  ✓ Processed ${processed}/${feedbackItems.length} items...`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  ✗ Error processing feedback ${item.id}:`, error.message);
      errors.push({ id: item.id, error: error.message });
    }
  }

  return { processed, total: feedbackItems.length, errors };
}

async function main() {
  try {
    console.log('🌟 Starting AI processing for existing feedback...\n');
    console.log('This will:');
    console.log('  1. Categorize feedback using keyword matching');
    console.log('  2. Determine sentiment (positive/neutral/negative)');
    console.log('  3. Score urgency using OpenAI GPT-4');
    console.log('  4. Generate AI reasoning for each score\n');
    console.log('─'.repeat(60));
    console.log('');

    const result = await processAllFeedback();

    console.log('');
    console.log('─'.repeat(60));
    console.log('\n✨ Processing complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Processed: ${result.processed}/${result.total}`);
    console.log(`   - Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach((err: any) => {
        console.log(`   - ${err.id}: ${err.error}`);
      });
    }

    console.log('\n🎯 Next: Check the dashboards at http://localhost:5174');

  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

main();
