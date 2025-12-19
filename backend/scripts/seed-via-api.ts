/**
 * Seed script that uses the REST API endpoints
 * This demonstrates the proper way to ingest feedback using different payload shapes
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE_URL = 'http://localhost:3000';

// Realistic customer data
const CUSTOMERS = [
  // Enterprise Tier (5 customers)
  { email: 'sarah.chen@techcorp.com', tier: 'enterprise', company_name: 'TechCorp Solutions' },
  { email: 'michael.rodriguez@globalbank.io', tier: 'enterprise', company_name: 'GlobalBank Financial' },
  { email: 'jennifer.kim@retailgiant.com', tier: 'enterprise', company_name: 'RetailGiant Inc' },
  { email: 'david.oconnor@healthsystems.net', tier: 'enterprise', company_name: 'HealthSystems Network' },
  { email: 'lisa.anderson@edtech.edu', tier: 'enterprise', company_name: 'EdTech Academy' },

  // Pro Tier (5 customers)
  { email: 'alex.johnson@startup.io', tier: 'pro', company_name: 'Startup Accelerate' },
  { email: 'chris.lee@consultingfirm.net', tier: 'pro', company_name: 'Lee Consulting' },
  { email: 'kevin.patel@devshop.dev', tier: 'pro', company_name: 'DevShop Solutions' },
  { email: 'ryan.davis@cloudservices.tech', tier: 'pro', company_name: 'Cloud Services Tech' },
  { email: 'olivia.taylor@contentcreators.media', tier: 'pro', company_name: 'Content Creators Media' },

  // Free Tier (5 customers)
  { email: 'john.smith@gmail.com', tier: 'free', company_name: null },
  { email: 'mike.wilson@outlook.com', tier: 'free', company_name: null },
  { email: 'noah.brown@gmail.com', tier: 'free', company_name: null },
];

/**
 * Generate feedback with different payload shapes based on source
 * This demonstrates the payload normalization feature
 */
function generateFeedbackBatch() {
  const feedback: any[] = [];

  // 1. SUPPORT TICKETS - Using source-specific payload shape
  feedback.push(
    {
      content: 'CRITICAL: Payment gateway is down! All transactions failing with 503 errors. We cannot process any orders right now. This is costing us thousands per minute!',
      ticket_id: 'TICK-001',
      channel: 'email',
      customer_email: 'sarah.chen@techcorp.com',
      customer_tier: 'enterprise',
      customer_company: 'TechCorp Solutions',
    },
    {
      content: 'Production database migration failed mid-process. Half our customer data is inaccessible. Users cannot log in. Need immediate rollback assistance!',
      ticket_id: 'TICK-002',
      channel: 'email',
      customer_email: 'sarah.chen@techcorp.com',
      customer_tier: 'enterprise',
      customer_company: 'TechCorp Solutions',
      assigned_agent: 'support@company.com',
    },
    {
      content: 'Email notifications stopped working 2 hours ago. No confirmation emails, no alerts, nothing. Critical for our workflow. What happened?',
      ticket_id: 'TICK-003',
      channel: 'chat',
      customer_email: 'sarah.chen@techcorp.com',
      customer_tier: 'enterprise',
      customer_company: 'TechCorp Solutions',
    },
    {
      content: 'API rate limiting is completely broken. Getting 429 errors even with zero requests. Our integration is dead and customers are complaining.',
      ticket_id: 'TICK-004',
      channel: 'email',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
      customer_company: 'Startup Accelerate',
    },
    {
      content: 'Dashboard is showing incorrect metrics since this morning. Revenue numbers are way off. Need this fixed before our board meeting at 3pm today!',
      ticket_id: 'TICK-005',
      channel: 'chat',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
      customer_company: 'Startup Accelerate',
    },
    {
      content: 'File uploads timing out for files over 10MB. Worked fine yesterday. Now getting "Request timeout" errors after 30 seconds.',
      ticket_id: 'TICK-006',
      channel: 'email',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
      customer_company: 'Startup Accelerate',
    },
    {
      content: 'Can I have multiple users on the Pro plan? The pricing page is unclear about this.',
      ticket_id: 'TICK-007',
      channel: 'chat',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
      customer_company: 'Startup Accelerate',
    },
  );

  // 2. NPS SURVEYS - Using NPS-specific payload shape
  feedback.push(
    {
      content: 'Absolutely love the new dashboard redesign! So much cleaner and easier to use.',
      nps_score: 10,
      survey_campaign: 'Q1-2024',
      customer_email: 'chris.lee@consultingfirm.net',
      customer_tier: 'pro',
      customer_company: 'Lee Consulting',
    },
    {
      content: 'Your customer support team is amazing! They helped me resolve my issue in minutes.',
      nps_score: 9,
      survey_campaign: 'Q1-2024',
      customer_email: 'ryan.davis@cloudservices.tech',
      customer_tier: 'pro',
      customer_company: 'Cloud Services Tech',
    },
    {
      content: 'Love the product but really wish you would add dark mode. That would make it perfect!',
      nps_score: 8,
      survey_campaign: 'Q1-2024',
      customer_email: 'kevin.patel@devshop.dev',
      customer_tier: 'pro',
      customer_company: 'DevShop Solutions',
    },
    {
      content: 'Good product overall but needs better documentation. Took me hours to figure out basic features.',
      nps_score: 7,
      survey_campaign: 'Q1-2024',
      customer_email: 'michael.rodriguez@globalbank.io',
      customer_tier: 'enterprise',
      customer_company: 'GlobalBank Financial',
    },
    {
      content: 'Very disappointed with recent performance issues. App is much slower than before.',
      nps_score: 3,
      survey_campaign: 'Q1-2024',
      customer_email: 'jennifer.kim@retailgiant.com',
      customer_tier: 'enterprise',
      customer_company: 'RetailGiant Inc',
    },
    {
      content: 'Frustrated with the lack of customer support response. Waiting 48+ hours for basic questions.',
      nps_score: 4,
      survey_campaign: 'Q1-2024',
      customer_email: 'david.oconnor@healthsystems.net',
      customer_tier: 'enterprise',
      customer_company: 'HealthSystems Network',
    },
  );

  // 3. APP STORE REVIEWS - Using AppStore-specific payload shape
  feedback.push(
    {
      content: 'App crashes on startup after latest update (v4.1.0). Completely unusable. Tried reinstalling 3 times. iPhone 15 Pro, iOS 18. Please fix ASAP!',
      store: 'ios',
      app_version: '4.1.0',
      star_rating: 1,
      reviewer_username: 'frustrated_ios_user',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
    },
    {
      content: 'Keeps crashing when I try to upload photos. Very frustrating!',
      store: 'ios',
      app_version: '4.1.0',
      star_rating: 2,
      reviewer_username: 'photo_user',
    },
    {
      content: 'Best productivity app I have ever used. Highly recommend to everyone!',
      store: 'ios',
      app_version: '4.0.9',
      star_rating: 5,
      reviewer_username: 'happy_customer',
    },
    {
      content: 'Great app but needs dark mode badly. Will give 5 stars when you add it.',
      store: 'ios',
      app_version: '4.1.0',
      star_rating: 4,
      reviewer_username: 'night_owl',
    },
    {
      content: 'Please add dark mode! My eyes hurt after working all day with the bright white interface.',
      store: 'android',
      app_version: '4.1.0',
      star_rating: 4,
      reviewer_username: 'android_power_user',
      customer_email: 'ryan.davis@cloudservices.tech',
      customer_tier: 'pro',
    },
  );

  // 4. SOCIAL MENTIONS - Using Social-specific payload shape
  feedback.push(
    {
      content: 'When are you guys adding dark mode? Every modern app has it now.',
      platform: 'twitter',
      author_handle: '@techuser',
      engagement_count: 15,
      post_url: 'https://twitter.com/techuser/status/123',
    },
    {
      content: 'Anyone else having issues with @ourapp login today? Been down for hours.',
      platform: 'twitter',
      author_handle: '@frustrated_user',
      engagement_count: 34,
      post_url: 'https://twitter.com/frustrated_user/status/124',
    },
    {
      content: 'Just discovered this app and it is incredible! Why did nobody tell me about this before?',
      platform: 'twitter',
      author_handle: '@newuser',
      engagement_count: 89,
      post_url: 'https://twitter.com/newuser/status/456',
    },
    {
      content: 'Really unhappy with the new UI redesign. Old version was much better.',
      platform: 'reddit',
      author_handle: 'u/oldschool',
      engagement_count: 45,
      post_url: 'https://reddit.com/r/app/post123',
    },
  );

  // 5. MORE SUPPORT TICKETS - Various severities and categories
  feedback.push(
    {
      content: 'Security vulnerability found! SQL injection possible in search endpoint. Details attached. URGENT - please patch immediately!',
      ticket_id: 'TICK-008',
      channel: 'email',
      customer_email: 'michael.rodriguez@globalbank.io',
      customer_tier: 'enterprise',
      customer_company: 'GlobalBank Financial',
    },
    {
      content: 'Data export feature not working. Getting empty CSV files when trying to export customer reports. Need this for compliance audit tomorrow.',
      ticket_id: 'TICK-009',
      channel: 'email',
      customer_email: 'jennifer.kim@retailgiant.com',
      customer_tier: 'enterprise',
      customer_company: 'RetailGiant Inc',
    },
    {
      content: 'Mobile app is draining battery like crazy after update. Went from 10% battery drain per hour to 30%! Please investigate.',
      ticket_id: 'TICK-010',
      channel: 'chat',
      customer_email: 'lisa.anderson@edtech.edu',
      customer_tier: 'enterprise',
      customer_company: 'EdTech Academy',
    },
    {
      content: 'How do I reset my password? Forgot password link is not sending any emails.',
      ticket_id: 'TICK-011',
      channel: 'email',
      customer_email: 'john.smith@gmail.com',
      customer_tier: 'free',
    },
    {
      content: 'Love the new features! Quick question: how do I export data to Excel format instead of CSV?',
      ticket_id: 'TICK-012',
      channel: 'chat',
      customer_email: 'chris.lee@consultingfirm.net',
      customer_tier: 'pro',
      customer_company: 'Lee Consulting',
    },
    {
      content: 'SSO integration with Azure AD failing. Getting "invalid_grant" errors. Blocking 500+ users from accessing the platform. URGENT!',
      ticket_id: 'TICK-013',
      channel: 'email',
      customer_email: 'david.oconnor@healthsystems.net',
      customer_tier: 'enterprise',
      customer_company: 'HealthSystems Network',
      assigned_agent: 'support@company.com',
    },
    {
      content: 'Would love to see Slack integration. Any plans to add this? Would save us hours per week.',
      ticket_id: 'TICK-014',
      channel: 'email',
      customer_email: 'olivia.taylor@contentcreators.media',
      customer_tier: 'pro',
      customer_company: 'Content Creators Media',
    },
    {
      content: 'Webhook notifications stopped working yesterday. Our entire automation pipeline is broken. No error messages, just silence.',
      ticket_id: 'TICK-015',
      channel: 'email',
      customer_email: 'kevin.patel@devshop.dev',
      customer_tier: 'pro',
      customer_company: 'DevShop Solutions',
    },
  );

  // 6. MORE NPS SURVEYS - Different sentiments
  feedback.push(
    {
      content: 'Product is okay but nothing special. Does the job but competitors have better features.',
      nps_score: 6,
      survey_campaign: 'Q1-2024',
      customer_email: 'john.smith@gmail.com',
      customer_tier: 'free',
    },
    {
      content: 'Amazing product! Been using it for 2 years and it keeps getting better. Worth every penny.',
      nps_score: 10,
      survey_campaign: 'Q1-2024',
      customer_email: 'lisa.anderson@edtech.edu',
      customer_tier: 'enterprise',
      customer_company: 'EdTech Academy',
    },
    {
      content: 'Terrible experience. Constant bugs, slow support, overpriced. Looking for alternatives.',
      nps_score: 1,
      survey_campaign: 'Q1-2024',
      customer_email: 'mike.wilson@outlook.com',
      customer_tier: 'free',
    },
    {
      content: 'Solid product but the pricing is getting too expensive for what we get. Considering downgrade.',
      nps_score: 5,
      survey_campaign: 'Q1-2024',
      customer_email: 'olivia.taylor@contentcreators.media',
      customer_tier: 'pro',
      customer_company: 'Content Creators Media',
    },
    {
      content: 'Great for small teams but lacks enterprise features like RBAC and audit logs.',
      nps_score: 7,
      survey_campaign: 'Q1-2024',
      customer_email: 'alex.johnson@startup.io',
      customer_tier: 'pro',
      customer_company: 'Startup Accelerate',
    },
  );

  // 7. MORE APP STORE REVIEWS
  feedback.push(
    {
      content: 'Offline mode finally works! Can now use the app on flights. Thank you devs!',
      store: 'ios',
      app_version: '4.1.0',
      star_rating: 5,
      reviewer_username: 'frequent_flyer',
      customer_email: 'michael.rodriguez@globalbank.io',
      customer_tier: 'enterprise',
    },
    {
      content: 'App is too slow. Takes 10+ seconds to load dashboard. Needs performance optimization.',
      store: 'android',
      app_version: '4.0.8',
      star_rating: 3,
      reviewer_username: 'impatient_user',
    },
    {
      content: 'Latest update broke notifications. Not getting any alerts anymore. Please fix!',
      store: 'android',
      app_version: '4.1.0',
      star_rating: 2,
      reviewer_username: 'notification_needed',
      customer_email: 'noah.brown@gmail.com',
      customer_tier: 'free',
    },
    {
      content: 'Interface is beautiful but needs iPad optimization. Everything is stretched weirdly.',
      store: 'ios',
      app_version: '4.1.0',
      star_rating: 4,
      reviewer_username: 'ipad_pro_user',
    },
  );

  // 8. MORE SOCIAL MENTIONS
  feedback.push(
    {
      content: 'Shoutout to @ourapp support team for resolving my issue in under 10 minutes! This is how you do customer service!',
      platform: 'twitter',
      author_handle: '@happy_customer',
      engagement_count: 156,
      post_url: 'https://twitter.com/happy_customer/status/789',
    },
    {
      content: 'Been using this app for 6 months. Best decision ever. Saved our company so much time.',
      platform: 'linkedin',
      author_handle: 'Sarah Chen',
      engagement_count: 42,
      post_url: 'https://linkedin.com/posts/sarah-chen/123',
      customer_email: 'sarah.chen@techcorp.com',
      customer_tier: 'enterprise',
    },
    {
      content: 'Is anyone else having trouble with the export feature? Third time this week it has failed on me.',
      platform: 'reddit',
      author_handle: 'u/data_analyst',
      engagement_count: 23,
      post_url: 'https://reddit.com/r/app/post456',
    },
    {
      content: 'New pricing is ridiculous. They doubled the price with minimal new features. Unsubscribing.',
      platform: 'twitter',
      author_handle: '@budget_conscious',
      engagement_count: 67,
      post_url: 'https://twitter.com/budget_conscious/status/999',
    },
  );

  return feedback;
}

/**
 * Call the batch feedback API endpoint
 */
async function seedFeedbackViaAPI() {
  console.log('🚀 Starting feedback ingestion via API...\n');

  const feedback = generateFeedbackBatch();
  console.log(`📝 Prepared ${feedback.length} feedback items with different payload shapes:`);
  console.log(`   - Support Tickets (ticket_id, channel)`);
  console.log(`   - NPS Surveys (nps_score, survey_campaign)`);
  console.log(`   - App Store Reviews (store, star_rating, app_version)`);
  console.log(`   - Social Mentions (platform, author_handle)\n`);

  console.log('📤 Sending batch request to POST /api/feedback/batch...');

  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: feedback }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();

    console.log('\n✅ Batch ingestion completed!');
    console.log(`\n📊 Results:`);
    console.log(`   ✓ Successfully ingested: ${result.ingested_count}`);
    console.log(`   ✗ Failed: ${result.failed_count}`);

    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Errors:`);
      result.errors.forEach((err: any) => {
        console.log(`   - Item ${err.index}: ${err.error}`);
      });
    }

    console.log(`\n🎯 Feedback IDs created: ${result.feedback_ids.length} items`);
    console.log(`\n✨ Seed completed successfully!`);
    console.log(`\nNext steps:`);
    console.log(`   1. Check the dashboard at http://localhost:5173`);
    console.log(`   2. Review urgent queue for critical items`);
    console.log(`   3. Verify different payload shapes were normalized correctly`);

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    console.error('\n💡 Make sure the backend server is running: npm run start:dev');
    process.exit(1);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Customer Feedback Triage System - API Seed');
  console.log('═══════════════════════════════════════════════════\n');

  await seedFeedbackViaAPI();
}

main();
