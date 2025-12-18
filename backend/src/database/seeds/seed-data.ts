import { SupabaseConfig } from '../../config/supabase.config';
import {
  FeedbackSource,
  CustomerTier,
} from '../../common/interfaces/feedback.interface';

const supabase = SupabaseConfig.getInstance();

// Sample customers with varying tiers
const CUSTOMERS = [
  // Enterprise customers
  { email: 'cto@acmecorp.com', tier: CustomerTier.ENTERPRISE, company_name: 'Acme Corporation' },
  { email: 'pm@techgiant.com', tier: CustomerTier.ENTERPRISE, company_name: 'Tech Giant Inc' },
  { email: 'support@enterprise-co.com', tier: CustomerTier.ENTERPRISE, company_name: 'Enterprise Co' },
  { email: 'admin@bizcorp.com', tier: CustomerTier.ENTERPRISE, company_name: 'Biz Corp' },
  { email: 'ops@megacorp.io', tier: CustomerTier.ENTERPRISE, company_name: 'Mega Corp' },

  // Pro customers
  { email: 'john@startup.io', tier: CustomerTier.PRO, company_name: 'Startup IO' },
  { email: 'sarah@saascompany.com', tier: CustomerTier.PRO, company_name: 'SaaS Company' },
  { email: 'mike@growth-stage.com', tier: CustomerTier.PRO, company_name: 'Growth Stage' },
  { email: 'lisa@scaleup.io', tier: CustomerTier.PRO, company_name: 'Scale Up' },
  { email: 'david@pro-users.com', tier: CustomerTier.PRO, company_name: 'Pro Users' },
  { email: 'emma@business-app.com', tier: CustomerTier.PRO, company_name: 'Business App' },
  { email: 'alex@profirm.io', tier: CustomerTier.PRO, company_name: 'Pro Firm' },

  // Free customers
  { email: 'user1@gmail.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user2@yahoo.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user3@outlook.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user4@gmail.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user5@hotmail.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user6@gmail.com', tier: CustomerTier.FREE, company_name: null },
  { email: 'user7@proton.me', tier: CustomerTier.FREE, company_name: null },
  { email: 'user8@gmail.com', tier: CustomerTier.FREE, company_name: null },
];

// Realistic feedback items spanning 30 days
const FEEDBACK_ITEMS = [
  // CRITICAL BUGS - Recent (High Urgency Expected)
  {
    source: FeedbackSource.SUPPORT,
    content: 'Payment processing fails with error 500 when using American Express cards. Tried 3 times, cannot complete checkout. This is blocking our monthly billing cycle.',
    customer_email: 'cto@acmecorp.com',
    metadata: { ticket_id: 'TICKET-001', channel: 'email', assigned_agent: 'sarah@company.com' },
    days_ago: 0.5,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'App crashes immediately on launch after updating to v2.1.0 on iOS 17. Cannot access any features at all.',
    customer_email: 'pm@techgiant.com',
    metadata: { ticket_id: 'TICKET-002', channel: 'chat' },
    days_ago: 1,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Crashes every single time I try to upload a photo. Makes the app completely unusable for my team.',
    metadata: { store: 'ios', app_version: '2.1.0', star_rating: 1, reviewer_username: 'frustrated_manager' },
    days_ago: 1,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Critical security issue: user data is visible in API responses without proper authentication. This is a data breach risk.',
    customer_email: 'admin@bizcorp.com',
    metadata: { ticket_id: 'TICKET-003', channel: 'email' },
    days_ago: 0.2,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Checkout page is broken on mobile - cannot tap the submit button. Losing sales because of this.',
    customer_email: 'john@startup.io',
    metadata: { ticket_id: 'TICKET-004', channel: 'chat' },
    days_ago: 2,
  },

  // Similar reports for crash issue (frequency boost)
  {
    source: FeedbackSource.APPSTORE,
    content: 'App crashes on iOS 17 after latest update. Please fix ASAP!',
    metadata: { store: 'ios', app_version: '2.1.0', star_rating: 2, reviewer_username: 'ios_user_123' },
    days_ago: 1.2,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Cannot open the app anymore after updating. Just crashes immediately.',
    metadata: { store: 'ios', app_version: '2.1.0', star_rating: 1, reviewer_username: 'mobile_worker' },
    days_ago: 1.5,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'iOS app crashes on startup, v2.1.0. Help!',
    customer_email: 'user1@gmail.com',
    metadata: { ticket_id: 'TICKET-005', channel: 'email' },
    days_ago: 1.3,
  },

  // HIGH PRIORITY BUGS
  {
    source: FeedbackSource.SUPPORT,
    content: 'Export to CSV feature is broken - getting corrupted files with garbled characters.',
    customer_email: 'ops@megacorp.io',
    metadata: { ticket_id: 'TICKET-006', channel: 'email' },
    days_ago: 3,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Notifications not working at all. Missing critical updates from my team.',
    customer_email: 'sarah@saascompany.com',
    metadata: { ticket_id: 'TICKET-007', channel: 'chat' },
    days_ago: 4,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Dashboard loads extremely slowly - takes 30+ seconds. This used to be instant.',
    customer_email: 'mike@growth-stage.com',
    metadata: { ticket_id: 'TICKET-008', channel: 'email' },
    days_ago: 2,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Search functionality is completely broken. Cannot find anything in my documents.',
    metadata: { store: 'android', app_version: '2.0.8', star_rating: 2, reviewer_username: 'android_pro' },
    days_ago: 5,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Login fails with "invalid credentials" even though password is correct. Had to reset 3 times.',
    customer_email: 'user2@yahoo.com',
    metadata: { ticket_id: 'TICKET-009', channel: 'email' },
    days_ago: 3,
  },

  // FEATURE REQUESTS - High frequency
  {
    source: FeedbackSource.SUPPORT,
    content: 'Would be great to have dark mode support. My eyes hurt using the app at night.',
    customer_email: 'lisa@scaleup.io',
    metadata: { ticket_id: 'TICKET-010', channel: 'chat' },
    days_ago: 7,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Love the product but really wish you would add dark mode. That would make it perfect!',
    customer_email: 'david@pro-users.com',
    metadata: { nps_score: 8, survey_campaign: 'Q1-2024' },
    days_ago: 8,
  },
  {
    source: FeedbackSource.SOCIAL,
    content: 'When are you guys adding dark mode? Every modern app has it now.',
    metadata: { platform: 'twitter', author_handle: '@techuser', engagement_count: 15, post_url: 'https://twitter.com/techuser/status/123' },
    days_ago: 6,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Great app but needs dark mode badly. Will give 5 stars when you add it.',
    metadata: { store: 'ios', app_version: '2.1.0', star_rating: 4, reviewer_username: 'night_owl' },
    days_ago: 9,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Please add support for bulk actions. Currently have to process items one by one which is tedious.',
    customer_email: 'admin@bizcorp.com',
    metadata: { ticket_id: 'TICKET-011', channel: 'email' },
    days_ago: 10,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Need API access to integrate with our internal tools. This is a must-have for enterprise customers.',
    customer_email: 'cto@acmecorp.com',
    metadata: { ticket_id: 'TICKET-012', channel: 'email' },
    days_ago: 12,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Would be nice to have a mobile app. Currently only using the web version.',
    customer_email: 'emma@business-app.com',
    metadata: { nps_score: 7, survey_campaign: 'Q1-2024' },
    days_ago: 15,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Wish we could export data to Excel format, not just CSV.',
    customer_email: 'user3@outlook.com',
    metadata: { ticket_id: 'TICKET-013', channel: 'email' },
    days_ago: 11,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Please add two-factor authentication for better security.',
    customer_email: 'support@enterprise-co.com',
    metadata: { ticket_id: 'TICKET-014', channel: 'email' },
    days_ago: 14,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Would love to see real-time collaboration features like Google Docs.',
    customer_email: 'john@startup.io',
    metadata: { ticket_id: 'TICKET-015', channel: 'chat' },
    days_ago: 16,
  },

  // COMPLAINTS & NEGATIVE FEEDBACK
  {
    source: FeedbackSource.NPS,
    content: 'Very disappointed with recent performance issues. App is much slower than before.',
    customer_email: 'ops@megacorp.io',
    metadata: { nps_score: 3, survey_campaign: 'Q1-2024' },
    days_ago: 5,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Frustrated with the lack of customer support response. Waiting 48+ hours for basic questions.',
    customer_email: 'alex@profirm.io',
    metadata: { nps_score: 4, survey_campaign: 'Q1-2024' },
    days_ago: 7,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Used to be great but latest update ruined everything. So many bugs now.',
    metadata: { store: 'android', app_version: '2.1.0', star_rating: 2, reviewer_username: 'disappointed_user' },
    days_ago: 6,
  },
  {
    source: FeedbackSource.SOCIAL,
    content: 'Really unhappy with the new UI redesign. Old version was much better.',
    metadata: { platform: 'reddit', author_handle: 'u/oldschool', engagement_count: 45, post_url: 'https://reddit.com/r/app/post123' },
    days_ago: 18,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Pricing increased by 30% but features stayed the same. Not happy about this.',
    customer_email: 'user4@gmail.com',
    metadata: { nps_score: 5, survey_campaign: 'Q1-2024' },
    days_ago: 20,
  },

  // PRAISE & POSITIVE FEEDBACK
  {
    source: FeedbackSource.NPS,
    content: 'Absolutely love the new dashboard redesign! So much cleaner and easier to use.',
    customer_email: 'sarah@saascompany.com',
    metadata: { nps_score: 10, survey_campaign: 'Q1-2024' },
    days_ago: 4,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Your customer support team is amazing! Sarah helped me resolve my issue in minutes.',
    customer_email: 'mike@growth-stage.com',
    metadata: { nps_score: 9, survey_campaign: 'Q1-2024' },
    days_ago: 8,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Best productivity app I have ever used. Highly recommend to everyone!',
    metadata: { store: 'ios', app_version: '2.0.9', star_rating: 5, reviewer_username: 'happy_customer' },
    days_ago: 10,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Thank you for the excellent product. It has transformed how our team works.',
    customer_email: 'pm@techgiant.com',
    metadata: { nps_score: 10, survey_campaign: 'Q1-2024' },
    days_ago: 12,
  },
  {
    source: FeedbackSource.SOCIAL,
    content: 'Just discovered this app and it is incredible! Why did nobody tell me about this before?',
    metadata: { platform: 'twitter', author_handle: '@newuser', engagement_count: 89, post_url: 'https://twitter.com/newuser/status/456' },
    days_ago: 9,
  },
  {
    source: FeedbackSource.NPS,
    content: 'The recent performance improvements are fantastic. App feels lightning fast now!',
    customer_email: 'lisa@scaleup.io',
    metadata: { nps_score: 9, survey_campaign: 'Q1-2024' },
    days_ago: 14,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Great app, great support, great experience overall. Keep up the amazing work!',
    metadata: { store: 'android', app_version: '2.1.0', star_rating: 5, reviewer_username: 'satisfied_user' },
    days_ago: 11,
  },

  // QUESTIONS & SUPPORT REQUESTS
  {
    source: FeedbackSource.SUPPORT,
    content: 'How do I export my data? Cannot find the option anywhere in the settings.',
    customer_email: 'user5@hotmail.com',
    metadata: { ticket_id: 'TICKET-016', channel: 'email' },
    days_ago: 6,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Can I use this app offline? Traveling next week and need to know.',
    customer_email: 'user6@gmail.com',
    metadata: { ticket_id: 'TICKET-017', channel: 'chat' },
    days_ago: 13,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Is there a way to change my email address on my account?',
    customer_email: 'user7@proton.me',
    metadata: { ticket_id: 'TICKET-018', channel: 'email' },
    days_ago: 17,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'How many users can I have on the Pro plan?',
    customer_email: 'david@pro-users.com',
    metadata: { ticket_id: 'TICKET-019', channel: 'chat' },
    days_ago: 19,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Can you explain how the billing cycle works? Confused about the charges.',
    customer_email: 'user8@gmail.com',
    metadata: { ticket_id: 'TICKET-020', channel: 'email' },
    days_ago: 21,
  },

  // MEDIUM PRIORITY BUGS
  {
    source: FeedbackSource.SUPPORT,
    content: 'Formatting issues when copying and pasting from Word documents.',
    customer_email: 'emma@business-app.com',
    metadata: { ticket_id: 'TICKET-021', channel: 'email' },
    days_ago: 8,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Email notifications are arriving 2-3 hours late.',
    customer_email: 'alex@profirm.io',
    metadata: { ticket_id: 'TICKET-022', channel: 'email' },
    days_ago: 11,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Images look pixelated when viewing on iPad Pro.',
    metadata: { store: 'ios', app_version: '2.1.0', star_rating: 3, reviewer_username: 'ipad_user' },
    days_ago: 15,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Calendar integration not syncing properly with Google Calendar.',
    customer_email: 'john@startup.io',
    metadata: { ticket_id: 'TICKET-023', channel: 'email' },
    days_ago: 14,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Print preview shows incorrect page breaks.',
    customer_email: 'user1@gmail.com',
    metadata: { ticket_id: 'TICKET-024', channel: 'email' },
    days_ago: 22,
  },

  // MIXED SENTIMENT
  {
    source: FeedbackSource.NPS,
    content: 'Good product overall but needs better documentation. Took me hours to figure out basic features.',
    customer_email: 'ops@megacorp.io',
    metadata: { nps_score: 7, survey_campaign: 'Q1-2024' },
    days_ago: 23,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Interface is great but performance could be better. Sometimes laggy on my laptop.',
    customer_email: 'sarah@saascompany.com',
    metadata: { nps_score: 8, survey_campaign: 'Q1-2024' },
    days_ago: 24,
  },
  {
    source: FeedbackSource.APPSTORE,
    content: 'Solid app with potential. Missing some features competitors have but heading in right direction.',
    metadata: { store: 'android', app_version: '2.1.0', star_rating: 4, reviewer_username: 'tech_reviewer' },
    days_ago: 25,
  },

  // OLDER FEEDBACK (Lower Priority)
  {
    source: FeedbackSource.SUPPORT,
    content: 'The color scheme is a bit too bright. Would prefer more muted colors.',
    customer_email: 'user2@yahoo.com',
    metadata: { ticket_id: 'TICKET-025', channel: 'email' },
    days_ago: 26,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Font size in mobile app is a bit small for my preference.',
    customer_email: 'user3@outlook.com',
    metadata: { ticket_id: 'TICKET-026', channel: 'email' },
    days_ago: 27,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Good value for money. Does what it says.',
    customer_email: 'user4@gmail.com',
    metadata: { nps_score: 8, survey_campaign: 'Q4-2023' },
    days_ago: 28,
  },
  {
    source: FeedbackSource.SUPPORT,
    content: 'Icon design could be more modern.',
    customer_email: 'user5@hotmail.com',
    metadata: { ticket_id: 'TICKET-027', channel: 'email' },
    days_ago: 29,
  },
  {
    source: FeedbackSource.NPS,
    content: 'Decent app. Nothing spectacular but gets the job done.',
    customer_email: 'user6@gmail.com',
    metadata: { nps_score: 7, survey_campaign: 'Q4-2023' },
    days_ago: 30,
  },

  // Additional variety (fill to 100)
  ...Array.from({ length: 50 }, (_, i) => ({
    source: [FeedbackSource.SUPPORT, FeedbackSource.NPS, FeedbackSource.APPSTORE, FeedbackSource.SOCIAL][i % 4],
    content: [
      `Feature suggestion: add keyboard shortcuts for common actions.`,
      `The app is generally good but could use more customization options.`,
      `Would appreciate better integration with Slack.`,
      `Loading times are acceptable but could be faster.`,
      `User interface is intuitive and easy to navigate.`,
      `Minor bug: dropdown menu doesn't close properly on mobile.`,
      `Great app! Using it daily for work.`,
      `The onboarding process was smooth and helpful.`,
      `Sometimes the app freezes for a few seconds when switching tabs.`,
      `Love the recent updates! Keep them coming.`,
      `Could you add more filter options in the search?`,
      `The help documentation is comprehensive and useful.`,
      `Minor visual glitch on the settings page.`,
      `Really impressed with the responsiveness of your support team.`,
      `The app meets all my needs perfectly.`,
      `Occasional sync issues with cloud storage.`,
      `Would be nice to have more theme options.`,
      `Performance has improved significantly over past months.`,
      `Simple feature request: ability to undo actions.`,
      `The pricing is fair for what you get.`,
      `Smooth user experience overall.`,
      `Minor suggestion: add tooltips for advanced features.`,
      `The app works well most of the time.`,
      `Would like to see more analytics and reporting features.`,
      `Easy to recommend to colleagues.`,
      `The mobile experience matches the web version nicely.`,
      `Occasional timeout errors when saving large files.`,
      `Great balance of features and simplicity.`,
      `The recent UI tweaks are an improvement.`,
      `Would appreciate more export format options.`,
      `Reliable and stable application.`,
      `Minor UX improvement: remember my last view preference.`,
      `The app has become essential to my workflow.`,
      `Sometimes notifications are duplicated.`,
      `Impressed with how frequently you release improvements.`,
      `The free tier is generous and useful.`,
      `Would like batch editing capabilities.`,
      `Clean design and good performance.`,
      `Occasional confusion with navigation menu.`,
      `The upgrade to Pro was worth it.`,
      `Minor issue: autocomplete sometimes suggests wrong options.`,
      `Great product that keeps getting better.`,
      `The search could be more intelligent.`,
      `Happy with my subscription.`,
      `Would appreciate more keyboard navigation support.`,
      `Solid foundation with room for growth.`,
      `The sharing features work perfectly.`,
      `Minor performance lag on older devices.`,
      `Excellent value proposition.`,
      `The recent security updates are reassuring.`,
    ][i % 50],
    customer_email: CUSTOMERS[i % CUSTOMERS.length].email,
    metadata: i % 2 === 0
      ? { ticket_id: `TICKET-${String(i + 100).padStart(3, '0')}`, channel: 'email' }
      : { nps_score: 7 + (i % 4), survey_campaign: 'Q1-2024' },
    days_ago: 5 + (i % 25),
  })),
];

/**
 * Calculate date offset
 */
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Seed customers
 */
async function seedCustomers() {
  console.log('🌱 Seeding customers...');

  for (const customer of CUSTOMERS) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'email' })
      .select();

    if (error) {
      console.error(`Error seeding customer ${customer.email}:`, error.message);
    } else {
      console.log(`✅ Seeded customer: ${customer.email}`);
    }
  }
}

/**
 * Seed feedback using the batch API endpoint
 */
async function seedFeedback() {
  console.log('🌱 Seeding feedback items...');

  const feedbackWithDates = FEEDBACK_ITEMS.map((item: any) => {
    const { days_ago, ...rest } = item;
    return rest;
  });

  // Note: This seed script should call the actual API endpoint to properly
  // trigger categorization and prioritization logic
  console.log(`📊 Total feedback items to seed: ${feedbackWithDates.length}`);
  console.log('⚠️  To seed feedback, use the POST /api/feedback/batch endpoint');
  console.log('Example curl command:\n');
  console.log('curl -X POST http://localhost:3000/api/feedback/batch \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"items": [...feedback_items...]}\'');
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('🚀 Starting database seeding...\n');

    await seedCustomers();
    console.log('\n✅ Customer seeding complete!\n');

    await seedFeedback();
    console.log('\n✅ Seed script complete!');
    console.log('💡 Remember to run the SQL migration first: src/database/migrations/001_initial_schema.sql');
    console.log('💡 Then seed feedback via the API endpoint for proper processing');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seed();
}

export { CUSTOMERS, FEEDBACK_ITEMS, seed };
