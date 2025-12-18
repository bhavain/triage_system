import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const API_BASE = 'http://localhost:3000/api';

async function processFeedbackBatch() {
  try {
    console.log('🤖 Fetching unprocessed feedback...\n');

    // Get all feedback that needs processing
    const { data: feedbackItems, error } = await supabase
      .from('feedback')
      .select(`
        id,
        content,
        source,
        customer_id,
        customers (tier, company_name)
      `)
      .is('urgency_score', null);

    if (error) {
      throw error;
    }

    console.log(`📝 Found ${feedbackItems.length} items to process\n`);

    // Process through backend API batch endpoint
    const batchData = feedbackItems.map((item: any) => ({
      source: item.source,
      content: item.content,
      customer_email: item.customers?.tier ? 'existing-customer@company.com' : undefined,
      customer_tier: item.customers?.tier || undefined,
      customer_company: item.customers?.company_name || undefined,
      metadata: {}
    }));

    console.log('🚀 Sending to backend API for AI processing...\n');

    const response = await fetch(`${API_BASE}/feedback/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: batchData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    console.log('✅ Processing complete!\n');
    console.log('📊 Results:');
    console.log(`   - Ingested: ${result.ingested_count}`);
    console.log(`   - Failed: ${result.failed_count}`);

    if (result.failed_count > 0 && result.errors) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach((err: any) => {
        console.log(`   - Item ${err.index}: ${err.error}`);
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Processing failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🌟 Starting AI processing for feedback...\n');
  console.log('This will:');
  console.log('  1. Categorize feedback using keyword matching');
  console.log('  2. Score urgency using OpenAI GPT-4');
  console.log('  3. Generate AI reasoning for each score');
  console.log('  4. Detect similar feedback for frequency counts\n');
  console.log('⏱️  This may take several minutes...\n');
  console.log('─'.repeat(60));
  console.log('');

  await processFeedbackBatch();

  console.log('');
  console.log('─'.repeat(60));
  console.log('\n✨ All feedback processed successfully!');
  console.log('\n🎯 Next: Check the dashboards at http://localhost:5174');
}

main();
