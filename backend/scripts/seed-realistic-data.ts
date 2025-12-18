import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Realistic customer data
const CUSTOMERS = [
  // Enterprise Tier (8 customers)
  { email: 'sarah.chen@techcorp.com', tier: 'enterprise', company_name: 'TechCorp Solutions' },
  { email: 'michael.rodriguez@globalbank.io', tier: 'enterprise', company_name: 'GlobalBank Financial' },
  { email: 'jennifer.kim@retailgiant.com', tier: 'enterprise', company_name: 'RetailGiant Inc' },
  { email: 'david.oconnor@healthsystems.net', tier: 'enterprise', company_name: 'HealthSystems Network' },
  { email: 'emily.watson@manufacturing.co', tier: 'enterprise', company_name: 'Advanced Manufacturing Co' },
  { email: 'james.thompson@logistics.world', tier: 'enterprise', company_name: 'Logistics World' },
  { email: 'lisa.anderson@edtech.edu', tier: 'enterprise', company_name: 'EdTech Academy' },
  { email: 'robert.martinez@saascompany.io', tier: 'enterprise', company_name: 'SaaS Innovations' },

  // Pro Tier (9 customers)
  { email: 'alex.johnson@startup.io', tier: 'pro', company_name: 'Startup Accelerate' },
  { email: 'maria.garcia@designstudio.com', tier: 'pro', company_name: 'Creative Design Studio' },
  { email: 'chris.lee@consultingfirm.net', tier: 'pro', company_name: 'Lee Consulting' },
  { email: 'amanda.brown@marketing.agency', tier: 'pro', company_name: 'Digital Marketing Plus' },
  { email: 'kevin.patel@devshop.dev', tier: 'pro', company_name: 'DevShop Solutions' },
  { email: 'sophia.wright@analytics.co', tier: 'pro', company_name: 'Analytics Insights' },
  { email: 'daniel.miller@ecommerce.store', tier: 'pro', company_name: 'E-Commerce Hub' },
  { email: 'olivia.taylor@contentcreators.media', tier: 'pro', company_name: 'Content Creators Media' },
  { email: 'ryan.davis@cloudservices.tech', tier: 'pro', company_name: 'Cloud Services Tech' },

  // Free Tier (8 customers)
  { email: 'john.smith@gmail.com', tier: 'free', company_name: null },
  { email: 'jane.doe@yahoo.com', tier: 'free', company_name: null },
  { email: 'mike.wilson@outlook.com', tier: 'free', company_name: null },
  { email: 'emma.jones@hotmail.com', tier: 'free', company_name: null },
  { email: 'noah.brown@gmail.com', tier: 'free', company_name: null },
  { email: 'ava.martinez@icloud.com', tier: 'free', company_name: null },
  { email: 'william.anderson@proton.me', tier: 'free', company_name: null },
  { email: 'isabella.thomas@gmail.com', tier: 'free', company_name: null },
];

// Realistic feedback spanning Q4 2024 (October - December)
const FEEDBACK_TEMPLATES = {
  // Critical Bugs (High Urgency)
  bugs_critical: [
    { content: 'Payment processing completely fails when using American Express cards. Tried 5 times, keeps returning error 500. This is blocking our entire sales team from closing deals.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-001', channel: 'email', priority: 'critical' } },
    { content: 'App crashes immediately on launch after the latest iOS 17 update. Cannot access any features. Multiple users reporting the same issue.', source: 'appstore', sentiment: 'negative', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 1 } },
    { content: 'Data export feature is broken - CSV downloads are corrupted with missing columns. We need this for compliance reporting by end of month.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-002', channel: 'chat', assigned_agent: 'support@company.com' } },
    { content: 'Critical security issue: User passwords visible in plain text in profile API response. Please fix ASAP!', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-003', channel: 'email', priority: 'critical' } },
    { content: 'Checkout flow broken on mobile Safari - cannot complete purchase. Losing thousands in revenue daily.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-004', channel: 'phone' } },
    { content: 'Login system down for 3 hours today. Enterprise customers cannot access the platform. Unacceptable for business-critical operations.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-005', channel: 'email', priority: 'critical' } },
    { content: 'Database sync failing - customer data not updating in real-time. This is affecting our operations severely.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-006', channel: 'email' } },
    { content: 'File upload completely broken after yesterday\'s update. Cannot upload any documents. This is blocking all workflows.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-007', channel: 'chat' } },
  ],

  // Medium Bugs
  bugs_medium: [
    { content: 'Dashboard charts showing incorrect data for last 7 days. Numbers don\'t match when I export the raw data.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-101', channel: 'email' } },
    { content: 'Search function not working properly - returns irrelevant results even with exact keyword matches.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-102', channel: 'chat' } },
    { content: 'Notifications arriving 2-3 hours late. Not useful for time-sensitive updates.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-103', channel: 'email' } },
    { content: 'Profile picture upload fails intermittently. Works sometimes, fails other times with no clear pattern.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-104', channel: 'chat' } },
    { content: 'Timezone settings not being saved correctly. Keeps reverting to UTC despite multiple attempts to change.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-105', channel: 'email' } },
    { content: 'Dark mode toggle not working on Settings page. Everything else works but this specific page ignores the preference.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-106', channel: 'chat' } },
    { content: 'Email digest shows wrong dates - says "Last Week" but includes content from 2 weeks ago.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-107', channel: 'email' } },
    { content: 'Keyboard shortcuts not working in Firefox. Everything works fine in Chrome though.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-108', channel: 'email' } },
    { content: 'PDF export generates blank pages for reports with charts. Text-only reports work fine.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-109', channel: 'email' } },
    { content: 'Sorting by date in Activity Log doesn\'t work correctly - items appear in random order.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-110', channel: 'chat' } },
  ],

  // Feature Requests
  features: [
    { content: 'Please add bulk import from Excel. We have 10,000+ records to migrate and doing it manually is not feasible.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-201', channel: 'email' } },
    { content: 'Would love to see Slack integration for notifications. Our whole team lives in Slack.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 8, survey_campaign: 'Q4-2024' } },
    { content: 'API rate limits are too restrictive for our use case. Need at least 10,000 requests/hour instead of current 1,000.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-202', channel: 'email' } },
    { content: 'Can you add two-factor authentication? Security is critical for our compliance requirements.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-203', channel: 'email' } },
    { content: 'Please add dark mode! My eyes hurt after working all day with the bright white interface.', source: 'appstore', sentiment: 'neutral', metadata: { store: 'ios', app_version: '3.2.0', star_rating: 4 } },
    { content: 'Need ability to schedule reports to run automatically and email to stakeholders. Manual reports are time-consuming.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-204', channel: 'email' } },
    { content: 'Would be amazing to have mobile app for iOS and Android. Web interface is hard to use on phone.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 7, survey_campaign: 'Q4-2024' } },
    { content: 'Please add custom fields to user profiles. We need to track industry-specific data.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-205', channel: 'email' } },
    { content: 'Wish there was a way to duplicate existing projects instead of creating from scratch each time.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-206', channel: 'chat' } },
    { content: 'Can you add webhooks support? We want to integrate with our internal systems for real-time updates.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-207', channel: 'email' } },
    { content: 'Please add keyboard shortcuts for common actions. Power users would love this!', source: 'nps', sentiment: 'positive', metadata: { nps_score: 8, survey_campaign: 'Q4-2024' } },
    { content: 'Need better filtering options in reports - currently very limited and hard to find specific data.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-208', channel: 'email' } },
    { content: 'Would love to see SSO integration with Okta and Azure AD for enterprise authentication.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-209', channel: 'email' } },
    { content: 'Offline mode would be incredibly useful for field workers without reliable internet.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-210', channel: 'email' } },
  ],

  // Complaints
  complaints: [
    { content: 'Very disappointed with the recent price increase. 40% hike with no new features is hard to justify to management.', source: 'nps', sentiment: 'negative', metadata: { nps_score: 3, survey_campaign: 'Q4-2024' } },
    { content: 'Customer support response times have gotten much worse. Used to hear back in hours, now it takes 2-3 days.', source: 'nps', sentiment: 'negative', metadata: { nps_score: 4, survey_campaign: 'Q4-2024' } },
    { content: 'Performance has degraded significantly over last month. Pages take forever to load now.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-301', channel: 'email' } },
    { content: 'The new UI update is confusing and harder to use than before. Why fix what wasn\'t broken?', source: 'appstore', sentiment: 'negative', metadata: { store: 'android', app_version: '3.2.1', star_rating: 2 } },
    { content: 'Frustrated with constant bugs in recent releases. Feels like quality assurance has gone downhill.', source: 'nps', sentiment: 'negative', metadata: { nps_score: 2, survey_campaign: 'Q4-2024' } },
    { content: 'Migration process from old platform was painful and poorly documented. Lost a week of productivity.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-302', channel: 'email' } },
    { content: 'Too many emails from your system. I\'ve unsubscribed multiple times but still getting spammed.', source: 'support', sentiment: 'negative', metadata: { ticket_id: 'TICK-303', channel: 'email' } },
    { content: 'Pricing is not transparent - hidden fees and overage charges that weren\'t explained upfront.', source: 'nps', sentiment: 'negative', metadata: { nps_score: 3, survey_campaign: 'Q4-2024' } },
    { content: 'The mobile experience is terrible compared to desktop. Feels like an afterthought.', source: 'appstore', sentiment: 'negative', metadata: { store: 'ios', app_version: '3.2.0', star_rating: 2 } },
  ],

  // Praise
  praise: [
    { content: 'Absolutely love the new dashboard! So much easier to find what I need. Great job on the redesign!', source: 'nps', sentiment: 'positive', metadata: { nps_score: 10, survey_campaign: 'Q4-2024' } },
    { content: 'Customer support is outstanding! Sarah helped me resolve a complex issue in under 10 minutes. Impressed!', source: 'nps', sentiment: 'positive', metadata: { nps_score: 10, survey_campaign: 'Q4-2024' } },
    { content: 'This tool has transformed how our team collaborates. Productivity up 40% since switching. Highly recommend!', source: 'appstore', sentiment: 'positive', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 5 } },
    { content: 'The API documentation is excellent - clear examples and everything works as described. Made integration a breeze.', source: 'social', sentiment: 'positive', metadata: { platform: 'twitter', author_handle: '@devguru', engagement_count: 45 } },
    { content: 'Best investment we\'ve made this year. ROI was visible within first month. Thank you for building this!', source: 'nps', sentiment: 'positive', metadata: { nps_score: 10, survey_campaign: 'Q4-2024' } },
    { content: 'Love how fast everything loads. Performance is incredible even with large datasets.', source: 'appstore', sentiment: 'positive', metadata: { store: 'android', app_version: '3.2.1', star_rating: 5 } },
    { content: 'The onboarding experience was smooth and intuitive. Had our team up and running in one afternoon.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 9, survey_campaign: 'Q4-2024' } },
    { content: 'Security features are top-notch. Passed our enterprise security audit without any issues.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 9, survey_campaign: 'Q4-2024' } },
    { content: 'Regular updates with useful new features. Clear you listen to customer feedback. Keep it up!', source: 'appstore', sentiment: 'positive', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 5 } },
    { content: 'The reporting capabilities are fantastic - exactly what we needed for board presentations.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 9, survey_campaign: 'Q4-2024' } },
    { content: 'Amazing value for money. Paying fraction of what we paid for previous solution with better features.', source: 'nps', sentiment: 'positive', metadata: { nps_score: 10, survey_campaign: 'Q4-2024' } },
  ],

  // Questions
  questions: [
    { content: 'How do I export data to CSV? Cannot find the option anywhere in the interface.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-401', channel: 'chat' } },
    { content: 'Can I have multiple users on the Pro plan? The pricing page is unclear about this.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-402', channel: 'email' } },
    { content: 'What\'s the difference between archiving and deleting a project? Will I lose data?', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-403', channel: 'chat' } },
    { content: 'Is there a way to recover accidentally deleted items? I can\'t find a trash/recycle bin.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-404', channel: 'email' } },
    { content: 'How long is data retained after account cancellation? Need to know for compliance reasons.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-405', channel: 'email' } },
    { content: 'Can I integrate this with Zapier? Want to automate workflows with other tools.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-406', channel: 'chat' } },
    { content: 'What are the storage limits for file uploads on the Pro tier?', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-407', channel: 'chat' } },
    { content: 'How do I add team members and assign different permission levels?', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-408', channel: 'email' } },
    { content: 'Is my data encrypted at rest and in transit? Need details for security assessment.', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-409', channel: 'email' } },
    { content: 'Can I downgrade from Enterprise to Pro mid-contract? What happens to the data?', source: 'support', sentiment: 'neutral', metadata: { ticket_id: 'TICK-410', channel: 'email' } },
  ],
};

// Helper function to generate random date in Q4 2024
function randomDateInQ4(): string {
  const start = new Date('2024-10-01T00:00:00Z');
  const end = new Date('2024-12-31T23:59:59Z');
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

// Helper function to distribute dates across quarter with realistic patterns
function generateDistributedDates(count: number): string[] {
  const dates: string[] = [];

  // More feedback towards end of quarter (realistic pattern)
  // 20% in Oct, 30% in Nov, 50% in Dec
  const octCount = Math.floor(count * 0.20);
  const novCount = Math.floor(count * 0.30);
  const decCount = count - octCount - novCount;

  // October dates
  for (let i = 0; i < octCount; i++) {
    const day = Math.floor(Math.random() * 31) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    dates.push(`2024-10-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`);
  }

  // November dates
  for (let i = 0; i < novCount; i++) {
    const day = Math.floor(Math.random() * 30) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    dates.push(`2024-11-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`);
  }

  // December dates
  for (let i = 0; i < decCount; i++) {
    const day = Math.floor(Math.random() * 31) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    dates.push(`2024-12-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`);
  }

  return dates.sort();
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');

  await supabase.from('feedback_tags').delete().neq('id', 0);
  await supabase.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('✅ Existing data cleared');
}

async function seedCategories() {
  console.log('📁 Seeding categories...');

  // Check if categories exist
  const { data: existing } = await supabase.from('categories').select('id');

  if (existing && existing.length > 0) {
    console.log(`✅ Categories already exist (${existing.length})`);
    return;
  }

  // Insert categories
  const categories = [
    { id: 1, name: 'Bug Report', type: 'bug', keywords: ['crash', 'error', 'broken', 'not working', 'bug', 'issue', 'fails', 'freezes', 'stuck', 'glitch', '500', '404', 'problem', 'wrong'], description: 'Issues and bugs reported by users' },
    { id: 2, name: 'Feature Request', type: 'feature', keywords: ['wish', 'would be nice', 'should add', 'feature request', 'suggestion', 'can you', 'please add', 'missing', 'need', 'want', 'could you'], description: 'Feature requests and enhancement suggestions' },
    { id: 3, name: 'Complaint', type: 'complaint', keywords: ['frustrated', 'angry', 'terrible', 'worst', 'disappointed', 'useless', 'waste', 'slow', 'poor', 'bad experience', 'unhappy', 'horrible'], description: 'Customer complaints and negative experiences' },
    { id: 4, name: 'Praise', type: 'praise', keywords: ['love', 'great', 'amazing', 'awesome', 'excellent', 'perfect', 'thank you', 'fantastic', 'best', 'wonderful', 'incredible', 'outstanding'], description: 'Positive feedback and praise' },
    { id: 5, name: 'Question', type: 'question', keywords: ['how do i', 'how to', 'can i', 'is it possible', 'where is', 'what is', '?', 'help', 'confused', 'understand', 'explain'], description: 'Questions and requests for clarification' },
  ];

  const { error } = await supabase.from('categories').insert(categories);

  if (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }

  console.log(`✅ Seeded ${categories.length} categories`);
}

async function seedCustomers() {
  console.log('👥 Seeding customers...');

  const { data, error } = await supabase
    .from('customers')
    .insert(CUSTOMERS)
    .select();

  if (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} customers`);
  return data;
}

async function seedFeedback(customers: any[]) {
  console.log('💬 Seeding feedback...');

  const allFeedback: any[] = [];
  let dates = generateDistributedDates(180); // Generate 180 feedback items
  let dateIndex = 0;

  // Helper to get random customer by tier
  const getCustomerByTier = (tier: string) => {
    const filtered = customers.filter(c => c.tier === tier);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const getRandomCustomer = () => {
    return customers[Math.floor(Math.random() * customers.length)];
  };

  // Seed critical bugs (more urgent, enterprise/pro customers)
  for (const template of FEEDBACK_TEMPLATES.bugs_critical) {
    const customer = Math.random() > 0.3 ? getCustomerByTier('enterprise') : getCustomerByTier('pro');
    allFeedback.push({
      ...template,
      customer_id: customer.id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.7 ? 'reviewed' : 'new',
    });

    // Add duplicates for some critical bugs (to show frequency)
    if (Math.random() > 0.5) {
      allFeedback.push({
        ...template,
        customer_id: getRandomCustomer().id,
        created_at: dates[dateIndex++],
        status: 'new',
      });
    }
  }

  // Seed medium bugs
  for (const template of FEEDBACK_TEMPLATES.bugs_medium) {
    allFeedback.push({
      ...template,
      customer_id: getRandomCustomer().id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.6 ? 'reviewed' : 'new',
    });
  }

  // Seed feature requests
  for (const template of FEEDBACK_TEMPLATES.features) {
    allFeedback.push({
      ...template,
      customer_id: getRandomCustomer().id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.8 ? 'reviewed' : 'new',
    });

    // Popular feature requests get duplicates
    if (template.content.includes('dark mode') || template.content.includes('Slack') || template.content.includes('mobile app')) {
      for (let i = 0; i < 2; i++) {
        allFeedback.push({
          ...template,
          customer_id: getRandomCustomer().id,
          created_at: dates[dateIndex++],
          status: 'new',
        });
      }
    }
  }

  // Seed complaints
  for (const template of FEEDBACK_TEMPLATES.complaints) {
    allFeedback.push({
      ...template,
      customer_id: getRandomCustomer().id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.5 ? 'reviewed' : 'new',
    });
  }

  // Seed praise
  for (const template of FEEDBACK_TEMPLATES.praise) {
    allFeedback.push({
      ...template,
      customer_id: getRandomCustomer().id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.9 ? 'reviewed' : 'new',
    });
  }

  // Seed questions
  for (const template of FEEDBACK_TEMPLATES.questions) {
    allFeedback.push({
      ...template,
      customer_id: getRandomCustomer().id,
      created_at: dates[dateIndex++],
      status: Math.random() > 0.3 ? 'resolved' : 'reviewed',
    });
  }

  // Add some app store reviews without customer IDs
  const appStoreReviews = [
    { content: 'Great app but needs iPad optimization. Interface is tiny on larger screens.', source: 'appstore', sentiment: 'positive', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 4 }, customer_id: null, created_at: dates[dateIndex++] },
    { content: 'Keeps crashing when I try to upload photos. Very frustrating!', source: 'appstore', sentiment: 'negative', metadata: { store: 'android', app_version: '3.2.0', star_rating: 2 }, customer_id: null, created_at: dates[dateIndex++] },
    { content: 'Simple and elegant. Does exactly what I need without unnecessary complexity.', source: 'appstore', sentiment: 'positive', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 5 }, customer_id: null, created_at: dates[dateIndex++] },
    { content: 'Would be 5 stars if you added Apple Watch support!', source: 'appstore', sentiment: 'positive', metadata: { store: 'ios', app_version: '3.2.1', star_rating: 4 }, customer_id: null, created_at: dates[dateIndex++] },
  ];

  allFeedback.push(...appStoreReviews);

  // Social mentions without customer IDs
  const socialMentions = [
    { content: 'Just switched to @ourapp and wow, the difference is night and day! So much better than competitors.', source: 'social', sentiment: 'positive', metadata: { platform: 'twitter', author_handle: '@techreviewer', engagement_count: 127, post_url: 'https://twitter.com/techreviewer/status/123' }, customer_id: null, created_at: dates[dateIndex++] },
    { content: 'Anyone else having issues with @ourapp login today? Been down for hours.', source: 'social', sentiment: 'negative', metadata: { platform: 'twitter', author_handle: '@frustrated_user', engagement_count: 34, post_url: 'https://twitter.com/frustrated_user/status/124' }, customer_id: null, created_at: dates[dateIndex++] },
    { content: 'Comprehensive review of the platform - highly recommended for teams! [link]', source: 'social', sentiment: 'positive', metadata: { platform: 'linkedin', author_handle: 'product_reviewer', engagement_count: 89, post_url: 'https://linkedin.com/posts/review' }, customer_id: null, created_at: dates[dateIndex++] },
  ];

  allFeedback.push(...socialMentions);

  console.log(`📝 Prepared ${allFeedback.length} feedback items`);

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < allFeedback.length; i += batchSize) {
    const batch = allFeedback.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('feedback')
      .insert(batch)
      .select();

    if (error) {
      console.error('Error seeding feedback batch:', error);
      throw error;
    }

    inserted += data.length;
    console.log(`  ✓ Inserted ${inserted}/${allFeedback.length} feedback items`);
  }

  console.log(`✅ Seeded ${inserted} feedback items`);
}

async function main() {
  try {
    console.log('🌱 Starting realistic data seed for Q4 2024...\n');

    await clearExistingData();
    await seedCategories();
    const customers = await seedCustomers();
    await seedFeedback(customers);

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${CUSTOMERS.length} customers (8 enterprise, 9 pro, 8 free)`);
    console.log(`   - 180+ feedback items spanning Oct-Dec 2024`);
    console.log(`   - Realistic distribution across all categories`);
    console.log(`   - Multiple critical bugs for testing urgency`);
    console.log(`   - Duplicate feedback for frequency testing`);
    console.log('\n🎯 Next step: Run AI categorization and urgency scoring via backend API');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
