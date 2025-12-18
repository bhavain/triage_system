#!/bin/bash

# Customer Feedback Triage System - Seed Data Script
# This script seeds the database with realistic feedback items

API_URL="${API_URL:-http://localhost:3000}"

echo "🌱 Seeding Customer Feedback Triage System..."
echo "📡 API URL: $API_URL"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s "${API_URL}/api/feedback" > /dev/null 2>&1; then
    echo "❌ Error: Backend is not running at $API_URL"
    echo "   Please start the backend first: cd backend && npm run start:dev"
    exit 1
fi
echo "✅ Backend is running!"
echo ""

# Seed critical bugs (high urgency)
echo "🔴 Seeding critical bugs..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "Payment processing fails with error 500 when using American Express cards. Tried 3 times, cannot complete checkout. This is blocking our monthly billing cycle.",
        "customer_email": "cto@acmecorp.com",
        "customer_tier": "enterprise",
        "customer_company": "Acme Corporation",
        "metadata": {
          "ticket_id": "TICKET-001",
          "channel": "email",
          "assigned_agent": "sarah@company.com"
        }
      },
      {
        "source": "support",
        "content": "App crashes immediately on launch after updating to v2.1.0 on iOS 17. Cannot access any features at all.",
        "customer_email": "pm@techgiant.com",
        "customer_tier": "enterprise",
        "customer_company": "Tech Giant Inc",
        "metadata": {
          "ticket_id": "TICKET-002",
          "channel": "chat"
        }
      },
      {
        "source": "appstore",
        "content": "Crashes every single time I try to upload a photo. Makes the app completely unusable for my team.",
        "metadata": {
          "store": "ios",
          "app_version": "2.1.0",
          "star_rating": 1,
          "reviewer_username": "frustrated_manager"
        }
      },
      {
        "source": "support",
        "content": "Checkout page is broken on mobile - cannot tap the submit button. Losing sales because of this.",
        "customer_email": "john@startup.io",
        "customer_tier": "pro",
        "customer_company": "Startup IO",
        "metadata": {
          "ticket_id": "TICKET-004",
          "channel": "chat"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} critical items"

sleep 1

# Seed similar crash reports (frequency boost)
echo "📊 Seeding similar crash reports..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "appstore",
        "content": "App crashes on iOS 17 after latest update. Please fix ASAP!",
        "metadata": {
          "store": "ios",
          "app_version": "2.1.0",
          "star_rating": 2,
          "reviewer_username": "ios_user_123"
        }
      },
      {
        "source": "appstore",
        "content": "Cannot open the app anymore after updating. Just crashes immediately.",
        "metadata": {
          "store": "ios",
          "app_version": "2.1.0",
          "star_rating": 1,
          "reviewer_username": "mobile_worker"
        }
      },
      {
        "source": "support",
        "content": "iOS app crashes on startup, v2.1.0. Help!",
        "customer_email": "user1@gmail.com",
        "customer_tier": "free",
        "metadata": {
          "ticket_id": "TICKET-005",
          "channel": "email"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} similar crash reports"

sleep 1

# Seed high priority bugs
echo "🟠 Seeding high priority bugs..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "Export to CSV feature is broken - getting corrupted files with garbled characters.",
        "customer_email": "ops@megacorp.io",
        "customer_tier": "enterprise",
        "customer_company": "Mega Corp",
        "metadata": {
          "ticket_id": "TICKET-006",
          "channel": "email"
        }
      },
      {
        "source": "support",
        "content": "Notifications not working at all. Missing critical updates from my team.",
        "customer_email": "sarah@saascompany.com",
        "customer_tier": "pro",
        "customer_company": "SaaS Company",
        "metadata": {
          "ticket_id": "TICKET-007",
          "channel": "chat"
        }
      },
      {
        "source": "support",
        "content": "Dashboard loads extremely slowly - takes 30+ seconds. This used to be instant.",
        "customer_email": "mike@growth-stage.com",
        "customer_tier": "pro",
        "customer_company": "Growth Stage",
        "metadata": {
          "ticket_id": "TICKET-008",
          "channel": "email"
        }
      },
      {
        "source": "appstore",
        "content": "Search functionality is completely broken. Cannot find anything in my documents.",
        "metadata": {
          "store": "android",
          "app_version": "2.0.8",
          "star_rating": 2,
          "reviewer_username": "android_pro"
        }
      },
      {
        "source": "support",
        "content": "Login fails with invalid credentials even though password is correct. Had to reset 3 times.",
        "customer_email": "user2@yahoo.com",
        "customer_tier": "free",
        "metadata": {
          "ticket_id": "TICKET-009",
          "channel": "email"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} high priority bugs"

sleep 1

# Seed feature requests
echo "💡 Seeding feature requests..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "Would be great to have dark mode support. My eyes hurt using the app at night.",
        "customer_email": "lisa@scaleup.io",
        "customer_tier": "pro",
        "customer_company": "Scale Up",
        "metadata": {
          "ticket_id": "TICKET-010",
          "channel": "chat"
        }
      },
      {
        "source": "nps",
        "content": "Love the product but really wish you would add dark mode. That would make it perfect!",
        "customer_email": "david@pro-users.com",
        "customer_tier": "pro",
        "customer_company": "Pro Users",
        "metadata": {
          "nps_score": 8,
          "survey_campaign": "Q1-2024"
        }
      },
      {
        "source": "social",
        "content": "When are you guys adding dark mode? Every modern app has it now.",
        "metadata": {
          "platform": "twitter",
          "author_handle": "@techuser",
          "engagement_count": 15,
          "post_url": "https://twitter.com/techuser/status/123"
        }
      },
      {
        "source": "support",
        "content": "Please add support for bulk actions. Currently have to process items one by one which is tedious.",
        "customer_email": "admin@bizcorp.com",
        "customer_tier": "enterprise",
        "customer_company": "Biz Corp",
        "metadata": {
          "ticket_id": "TICKET-011",
          "channel": "email"
        }
      },
      {
        "source": "support",
        "content": "Need API access to integrate with our internal tools. This is a must-have for enterprise customers.",
        "customer_email": "cto@acmecorp.com",
        "customer_tier": "enterprise",
        "customer_company": "Acme Corporation",
        "metadata": {
          "ticket_id": "TICKET-012",
          "channel": "email"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} feature requests"

sleep 1

# Seed praise
echo "🎉 Seeding positive feedback..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "nps",
        "content": "Absolutely love the new dashboard redesign! So much cleaner and easier to use.",
        "customer_email": "sarah@saascompany.com",
        "customer_tier": "pro",
        "customer_company": "SaaS Company",
        "metadata": {
          "nps_score": 10,
          "survey_campaign": "Q1-2024"
        }
      },
      {
        "source": "nps",
        "content": "Your customer support team is amazing! Sarah helped me resolve my issue in minutes.",
        "customer_email": "mike@growth-stage.com",
        "customer_tier": "pro",
        "customer_company": "Growth Stage",
        "metadata": {
          "nps_score": 9,
          "survey_campaign": "Q1-2024"
        }
      },
      {
        "source": "appstore",
        "content": "Best productivity app I have ever used. Highly recommend to everyone!",
        "metadata": {
          "store": "ios",
          "app_version": "2.0.9",
          "star_rating": 5,
          "reviewer_username": "happy_customer"
        }
      },
      {
        "source": "nps",
        "content": "Thank you for the excellent product. It has transformed how our team works.",
        "customer_email": "pm@techgiant.com",
        "customer_tier": "enterprise",
        "customer_company": "Tech Giant Inc",
        "metadata": {
          "nps_score": 10,
          "survey_campaign": "Q1-2024"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} praise items"

sleep 1

# Seed complaints
echo "😤 Seeding complaints..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "nps",
        "content": "Very disappointed with recent performance issues. App is much slower than before.",
        "customer_email": "ops@megacorp.io",
        "customer_tier": "enterprise",
        "customer_company": "Mega Corp",
        "metadata": {
          "nps_score": 3,
          "survey_campaign": "Q1-2024"
        }
      },
      {
        "source": "nps",
        "content": "Frustrated with the lack of customer support response. Waiting 48+ hours for basic questions.",
        "customer_email": "alex@profirm.io",
        "customer_tier": "pro",
        "customer_company": "Pro Firm",
        "metadata": {
          "nps_score": 4,
          "survey_campaign": "Q1-2024"
        }
      },
      {
        "source": "appstore",
        "content": "Used to be great but latest update ruined everything. So many bugs now.",
        "metadata": {
          "store": "android",
          "app_version": "2.1.0",
          "star_rating": 2,
          "reviewer_username": "disappointed_user"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} complaints"

sleep 1

# Seed questions
echo "❓ Seeding questions..."
curl -s -X POST "${API_URL}/api/feedback/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "How do I export my data? Cannot find the option anywhere in the settings.",
        "customer_email": "user5@hotmail.com",
        "customer_tier": "free",
        "metadata": {
          "ticket_id": "TICKET-016",
          "channel": "email"
        }
      },
      {
        "source": "support",
        "content": "Can I use this app offline? Traveling next week and need to know.",
        "customer_email": "user6@gmail.com",
        "customer_tier": "free",
        "metadata": {
          "ticket_id": "TICKET-017",
          "channel": "chat"
        }
      },
      {
        "source": "support",
        "content": "How many users can I have on the Pro plan?",
        "customer_email": "david@pro-users.com",
        "customer_tier": "pro",
        "customer_company": "Pro Users",
        "metadata": {
          "ticket_id": "TICKET-019",
          "channel": "chat"
        }
      }
    ]
  }' | jq -r '.ingested_count' | xargs -I {} echo "  ✅ Ingested {} questions"

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📊 Summary:"
echo "   - Critical bugs with high urgency scores"
echo "   - Similar crash reports (frequency detection)"
echo "   - High priority bugs from various sources"
echo "   - Feature requests (including dark mode requests)"
echo "   - Positive feedback and praise"
echo "   - Customer complaints"
echo "   - Support questions"
echo ""
echo "🎯 Next steps:"
echo "   1. Open http://localhost:5173 to view the dashboard"
echo "   2. Check the urgent queue for prioritized items"
echo "   3. Look for AI-generated urgency reasoning"
echo "   4. Notice frequency indicators on similar issues"
echo ""
echo "💡 Tip: The critical bugs should show urgency scores of 85-95"
echo "    and the crash reports should show frequency indicators!"
