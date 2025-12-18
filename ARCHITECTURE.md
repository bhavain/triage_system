# Customer Feedback Triage System - Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Data Model](#data-model)
4. [Prioritization Algorithm](#prioritization-algorithm)
5. [API Specification](#api-specification)
6. [Technology Stack](#technology-stack)
7. [Implementation Phases](#implementation-phases)

---

## System Overview

### Purpose
A Customer Feedback Triage System that ingests feedback from multiple channels (support tickets, NPS surveys, app store reviews, social mentions), automatically categorizes and prioritizes it, and surfaces actionable insights through an intelligent dashboard.

### Key Design Principles
1. **Product-First Thinking**: Data model designed around actual user workflows (PM triage, support analysis, engineering debugging, executive reporting)
2. **Extensibility**: Architecture supports adding new feedback sources without major refactoring
3. **Intelligence**: LLM-powered prioritization considers multiple signals (customer value, frequency, severity, business impact)
4. **Actionability**: System doesn't just collect feedback—it tells users what to do about it

### Core Challenges Addressed
- **Multi-source normalization**: Different payload shapes → unified internal model
- **Signal vs Noise**: Intelligent prioritization surfaces what matters
- **Pattern Detection**: Identifies trending issues and similar feedback clusters
- **Role-based Views**: Different personas need different insights

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK SOURCES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Support  │  │   NPS    │  │   App    │  │  Social  │   │
│  │ Tickets  │  │ Surveys  │  │  Store   │  │ Mentions │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└────────┼─────────────┼─────────────┼─────────────┼─────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │       INGESTION API LAYER            │
         │  POST /api/feedback/batch            │
         │  - Validation                        │
         │  - Normalization                     │
         │  - Deduplication                     │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │     PROCESSING PIPELINE              │
         │  1. Keyword-based Categorization     │
         │  2. LLM-powered Urgency Scoring      │
         │  3. Similarity Detection             │
         │  4. Customer Enrichment              │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │      POSTGRESQL DATABASE             │
         │      (Supabase)                      │
         │  - feedback                          │
         │  - customers                         │
         │  - categories                        │
         │  - feedback_tags                     │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │       QUERY API LAYER                │
         │  GET  /api/feedback                  │
         │  GET  /api/feedback/:id              │
         │  GET  /api/insights/urgent           │
         │  GET  /api/insights/trends           │
         │  GET  /api/insights/summary          │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │      REACT DASHBOARD                 │
         │  - Urgent Queue (PM View)            │
         │  - Volume Analysis (Support View)    │
         │  - Bug Search (Engineering View)     │
         │  - Executive Summary (Founder View)  │
         └─────────────────────────────────────┘
```

### Data Flow

#### Ingestion Flow
```
External Source → API Validation → Category Detection → LLM Urgency Scoring
  → Frequency Analysis → DB Insert → Real-time Dashboard Update
```

#### Query Flow
```
User Request → API Endpoint → DB Query with Filters/Aggregations
  → Response Formatting → Dashboard Render
```

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                            │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                  UUID                                │
│    │ email               VARCHAR(255)  UNIQUE                │
│    │ tier                ENUM (free, pro, enterprise)        │
│    │ company_name        VARCHAR(255)  NULL                  │
│    │ created_at          TIMESTAMP                           │
│    │ updated_at          TIMESTAMP                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1:N
                     │
┌────────────────────▼────────────────────────────────────────┐
│                         FEEDBACK                             │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                  UUID                                │
│ FK │ customer_id         UUID  NULL  → customers.id          │
│ FK │ category_id         INT   NULL  → categories.id         │
│    │ source              ENUM (support, nps, appstore, social)│
│    │ content             TEXT                                │
│    │ urgency_score       INT (0-100)  NULL                   │
│    │ urgency_reasoning   TEXT  NULL                          │
│    │ sentiment           ENUM (positive, neutral, negative)  │
│    │ status              ENUM (new, reviewed, assigned, ...)  │
│    │ frequency_count     INT DEFAULT 1                       │
│    │ created_at          TIMESTAMP                           │
│    │ updated_at          TIMESTAMP                           │
│    │                                                          │
│    │ -- Source-specific metadata (JSONB)                     │
│    │ metadata            JSONB                               │
│    │   {                                                     │
│    │     // Support Tickets                                  │
│    │     "ticket_id": "string",                              │
│    │     "channel": "email|chat|phone",                      │
│    │     "assigned_agent": "string",                         │
│    │     "resolution_time": "number",                        │
│    │                                                          │
│    │     // NPS Surveys                                      │
│    │     "nps_score": 0-10,                                  │
│    │     "survey_campaign": "string",                        │
│    │     "response_date": "datetime",                        │
│    │                                                          │
│    │     // App Store Reviews                                │
│    │     "store": "ios|android",                             │
│    │     "app_version": "string",                            │
│    │     "star_rating": 1-5,                                 │
│    │     "reviewer_username": "string",                      │
│    │                                                          │
│    │     // Social Mentions                                  │
│    │     "platform": "twitter|linkedin|reddit",              │
│    │     "author_handle": "string",                          │
│    │     "engagement_count": "number",                       │
│    │     "post_url": "string"                                │
│    │   }                                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ N:1
                     │
┌────────────────────▼────────────────────────────────────────┐
│                        CATEGORIES                            │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                  SERIAL                              │
│    │ name                VARCHAR(100)  UNIQUE                │
│    │ type                ENUM (bug, feature, complaint,      │
│    │                           praise, question)             │
│    │ keywords            TEXT[]  (for categorization)        │
│    │ description         TEXT                                │
│    │ created_at          TIMESTAMP                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FEEDBACK_TAGS                           │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                  SERIAL                              │
│ FK │ feedback_id         UUID  → feedback.id                 │
│    │ tag                 VARCHAR(50)                         │
│    │ created_at          TIMESTAMP                           │
└─────────────────────────────────────────────────────────────┘
```

### Schema Rationale

#### Normalized Design
- **Customers table**: Separate entity for easier customer-level analysis and future customer 360 views
- **Categories table**: Centralized category management allows updating keywords without touching feedback records
- **Feedback_tags**: Many-to-many relationship for flexible tagging (e.g., "checkout", "mobile", "payment")

#### Key Design Decisions

1. **customer_id is nullable**: App store reviews and some social mentions may not have identifiable customers
2. **JSONB metadata**: Preserves source-specific fields without schema bloat, queryable with PostgreSQL JSON operators
3. **frequency_count**: Denormalized counter for performance (updated when similar feedback detected)
4. **urgency_score (0-100)**: Continuous scale allows flexible filtering/sorting, easier than categorical
5. **status field**: Enables workflow tracking (new → reviewed → assigned → resolved)

---

## Prioritization Algorithm

### Overview
The system uses an **LLM-powered urgency scoring** approach that analyzes multiple signals to determine how quickly feedback requires attention.

### Urgency Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| **Customer Value** | 30% | Enterprise > Pro > Free |
| **Severity** | 25% | Crashes/data loss > UX issues > cosmetic |
| **Frequency** | 20% | How many users reported similar issues |
| **Recency** | 15% | Feedback from last 24h > last week |
| **Business Impact** | 10% | Affects revenue (checkout, billing) vs non-critical |

### LLM Integration Approach

#### Input to LLM
```typescript
interface UrgencyAnalysisInput {
  feedback_content: string;
  customer_tier: 'free' | 'pro' | 'enterprise';
  category: string;
  frequency_count: number;  // Similar feedback in last 30 days
  created_at: Date;         // For recency calculation
  metadata: {
    // Source-specific context
    nps_score?: number;
    star_rating?: number;
    channel?: string;
  };
}
```

#### LLM Prompt Structure
```
You are a customer feedback triage assistant. Analyze the following feedback and assign an urgency score (0-100) based on these criteria:

FEEDBACK DETAILS:
- Content: "{feedback_content}"
- Source: {source}
- Customer Tier: {customer_tier}
- Category: {category}
- Similar reports in last 30 days: {frequency_count}
- Received: {time_ago}

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
  * Older: 2pts
- Business Impact (10%):
  * Revenue-affecting: 10pts
  * Onboarding-affecting: 7pts
  * Core feature: 5pts
  * Nice-to-have: 2pts

OUTPUT FORMAT (JSON):
{
  "urgency_score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "recommended_action": "immediate|same_day|this_week|backlog"
}
```

#### Example Scoring

**Example 1: High Urgency**
```
Content: "Payment processing fails with error 500, tried 3 times"
Customer: Enterprise (30pts)
Severity: Payment blocker (20pts)
Frequency: 8 similar reports (15pts)
Recency: 2 hours ago (15pts)
Business Impact: Revenue-affecting (10pts)
→ Total: 90/100 (CRITICAL)
```

**Example 2: Low Urgency**
```
Content: "Would be nice to have dark mode"
Customer: Free (10pts)
Severity: Nice-to-have (5pts)
Frequency: 1 report (5pts)
Recency: 10 days ago (2pts)
Business Impact: Nice-to-have (2pts)
→ Total: 24/100 (BACKLOG)
```

### Implementation Approach

```typescript
async function calculateUrgency(feedback: Feedback): Promise<UrgencyResult> {
  // 1. Calculate frequency count (similar feedback in last 30 days)
  const frequencyCount = await detectSimilarFeedback(feedback);

  // 2. Prepare LLM prompt
  const prompt = buildUrgencyPrompt({
    content: feedback.content,
    customer_tier: feedback.customer?.tier || 'unknown',
    category: feedback.category?.name,
    frequency_count: frequencyCount,
    created_at: feedback.created_at,
    metadata: feedback.metadata
  });

  // 3. Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "You are a customer feedback triage expert." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  // 4. Parse and validate response
  const result = JSON.parse(response.choices[0].message.content);

  return {
    urgency_score: result.urgency_score,
    urgency_reasoning: result.reasoning,
    recommended_action: result.recommended_action
  };
}
```

### Future Enhancements
- **Feedback loop**: Track if PM/support agrees with urgency → fine-tune weights
- **ML model**: Train custom model on historical triage decisions
- **Context awareness**: Consider customer churn risk, contract renewal dates
- **Escalation rules**: Auto-notify on-call engineer for 90+ score

---

## API Specification

### Base URL
```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

### Authentication
*(Phase 1: No auth required for MVP)*
*(Phase 2: Bearer token with Supabase Auth)*

---

### Endpoints

#### 1. Batch Feedback Ingestion

**POST** `/api/feedback/batch`

Accepts multiple feedback items from various sources in a unified format.

**Request Body:**
```typescript
{
  "items": [
    {
      "source": "support" | "nps" | "appstore" | "social",
      "content": string,
      "customer_email"?: string,  // Optional (app store reviews may not have)
      "customer_tier"?: "free" | "pro" | "enterprise",
      "customer_company"?: string,
      "metadata": {
        // Source-specific fields (see Data Model section)
      }
    }
  ]
}
```

**Response:**
```typescript
{
  "success": true,
  "ingested_count": number,
  "failed_count": number,
  "feedback_ids": string[],
  "errors"?: [
    {
      "index": number,
      "error": string
    }
  ]
}
```

**Status Codes:**
- `200 OK`: All items processed (check failed_count)
- `400 Bad Request`: Invalid payload structure
- `500 Internal Server Error`: Server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/feedback/batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "App crashes when I try to checkout",
        "customer_email": "john@acme.com",
        "customer_tier": "enterprise",
        "customer_company": "Acme Corp",
        "metadata": {
          "ticket_id": "TICKET-12345",
          "channel": "email",
          "assigned_agent": "sarah@company.com"
        }
      }
    ]
  }'
```

---

#### 2. Get Feedback List

**GET** `/api/feedback`

Retrieve feedback with filtering, sorting, and pagination.

**Query Parameters:**
```typescript
{
  // Filtering
  source?: "support" | "nps" | "appstore" | "social",
  category?: string,  // Category name
  customer_tier?: "free" | "pro" | "enterprise",
  status?: "new" | "reviewed" | "assigned" | "resolved",
  sentiment?: "positive" | "neutral" | "negative",
  min_urgency?: number,  // 0-100
  max_urgency?: number,
  date_from?: string,    // ISO date
  date_to?: string,
  search?: string,       // Full-text search in content

  // Sorting
  sort_by?: "urgency_score" | "created_at" | "frequency_count",
  sort_order?: "asc" | "desc",

  // Pagination
  page?: number,         // Default: 1
  limit?: number         // Default: 20, max: 100
}
```

**Response:**
```typescript
{
  "data": [
    {
      "id": string,
      "source": string,
      "content": string,
      "category": {
        "id": number,
        "name": string,
        "type": string
      },
      "customer": {
        "id": string,
        "email": string,
        "tier": string,
        "company_name": string
      } | null,
      "urgency_score": number,
      "urgency_reasoning": string,
      "sentiment": string,
      "status": string,
      "frequency_count": number,
      "created_at": string,
      "metadata": object
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}
```

**Example:**
```bash
# Get urgent bug reports from last 7 days
GET /api/feedback?category=bug&min_urgency=70&date_from=2024-01-10&sort_by=urgency_score&sort_order=desc
```

---

#### 3. Get Single Feedback

**GET** `/api/feedback/:id`

Retrieve detailed information for a specific feedback item.

**Response:**
```typescript
{
  "id": string,
  "source": string,
  "content": string,
  "category": {
    "id": number,
    "name": string,
    "type": string,
    "description": string
  },
  "customer": {
    "id": string,
    "email": string,
    "tier": string,
    "company_name": string
  } | null,
  "urgency_score": number,
  "urgency_reasoning": string,
  "sentiment": string,
  "status": string,
  "frequency_count": number,
  "similar_feedback": [  // Top 5 similar items
    {
      "id": string,
      "content": string,
      "created_at": string,
      "customer_tier": string
    }
  ],
  "tags": string[],
  "created_at": string,
  "updated_at": string,
  "metadata": object
}
```

---

#### 4. Get Urgent Queue

**GET** `/api/insights/urgent`

Returns high-priority feedback that needs immediate attention (PM morning triage view).

**Query Parameters:**
```typescript
{
  min_urgency?: number,  // Default: 70
  hours?: number         // Look back period, default: 24
}
```

**Response:**
```typescript
{
  "urgent_items": [
    {
      "id": string,
      "content": string,
      "urgency_score": number,
      "urgency_reasoning": string,
      "category": string,
      "customer_tier": string,
      "frequency_count": number,
      "created_at": string
    }
  ],
  "summary": {
    "total_urgent": number,
    "critical_count": number,  // 90-100
    "high_count": number,      // 70-89
    "by_category": {
      "bug": number,
      "feature": number,
      "complaint": number
    }
  }
}
```

---

#### 5. Get Trends Analysis

**GET** `/api/insights/trends`

Returns feedback volume trends and category distribution (Support lead view).

**Query Parameters:**
```typescript
{
  period?: "day" | "week" | "month",  // Default: "week"
  group_by?: "category" | "source" | "customer_tier"
}
```

**Response:**
```typescript
{
  "period": {
    "start": string,
    "end": string
  },
  "volume": {
    "total": number,
    "change_percent": number,  // vs previous period
    "by_day": [
      {
        "date": string,
        "count": number
      }
    ]
  },
  "by_category": [
    {
      "category": string,
      "count": number,
      "percent": number,
      "trend": "up" | "down" | "stable"
    }
  ],
  "by_source": [
    {
      "source": string,
      "count": number,
      "percent": number
    }
  ],
  "top_issues": [  // Most frequent similar feedback clusters
    {
      "representative_id": string,
      "summary": string,
      "count": number,
      "category": string
    }
  ]
}
```

---

#### 6. Get Executive Summary

**GET** `/api/insights/summary`

High-level metrics for board meetings (Founder view).

**Query Parameters:**
```typescript
{
  period?: "week" | "month" | "quarter",  // Default: "month"
}
```

**Response:**
```typescript
{
  "period": {
    "start": string,
    "end": string
  },
  "metrics": {
    "total_feedback": number,
    "nps_score": number,  // -100 to 100
    "nps_trend": "up" | "down" | "stable",
    "sentiment_distribution": {
      "positive": number,
      "neutral": number,
      "negative": number
    },
    "response_rate": number,  // % of feedback reviewed
    "avg_resolution_time": number  // hours
  },
  "top_categories": [
    {
      "category": string,
      "count": number,
      "change_percent": number
    }
  ],
  "critical_issues": [
    {
      "issue": string,
      "urgency_score": number,
      "affected_customers": number
    }
  ],
  "highlights": {
    "most_requested_feature": string,
    "biggest_pain_point": string,
    "praise_summary": string
  }
}
```

---

#### 7. Update Feedback Status

**PATCH** `/api/feedback/:id`

Update feedback status and other mutable fields.

**Request Body:**
```typescript
{
  "status"?: "new" | "reviewed" | "assigned" | "resolved",
  "assigned_to"?: string,
  "notes"?: string
}
```

**Response:**
```typescript
{
  "success": true,
  "feedback": { /* updated feedback object */ }
}
```

---

### Error Responses

All endpoints follow this error format:

```typescript
{
  "success": false,
  "error": {
    "code": string,  // e.g., "VALIDATION_ERROR", "NOT_FOUND"
    "message": string,
    "details"?: object
  }
}
```

---

## Technology Stack

### Backend

#### NestJS
**Why NestJS?**
- TypeScript-first framework with excellent type safety
- Built-in dependency injection for testability
- Modular architecture (separate modules for ingestion, insights, etc.)
- Powerful decorators for validation (@IsEmail, @IsEnum, etc.)
- Native support for OpenAPI/Swagger documentation

**Project Structure:**
```
backend/
├── src/
│   ├── modules/
│   │   ├── feedback/
│   │   │   ├── feedback.controller.ts
│   │   │   ├── feedback.service.ts
│   │   │   ├── feedback.module.ts
│   │   │   └── dto/
│   │   ├── customers/
│   │   ├── categories/
│   │   ├── insights/
│   │   └── prioritization/
│   │       ├── prioritization.service.ts  (LLM integration)
│   │       └── categorization.service.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── config/
│   │   ├── supabase.config.ts
│   │   └── openai.config.ts
│   └── main.ts
├── test/
└── package.json
```

#### Supabase (PostgreSQL)
**Why Supabase?**
- Managed PostgreSQL with excellent developer experience
- Built-in REST API (we'll use NestJS API but leverage Supabase for auth later)
- Real-time subscriptions for live dashboard updates
- Row Level Security for future multi-tenancy
- Free tier sufficient for assessment + demo

**Connection:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

#### OpenAI API
**Model:** GPT-4-turbo (or GPT-3.5-turbo for cost optimization)

**Integration:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

**Cost Considerations:**
- GPT-4-turbo: ~$0.01 per urgency calculation (500 tokens)
- GPT-3.5-turbo: ~$0.001 per calculation
- For 100 feedback items: ~$1 (GPT-4) or ~$0.10 (GPT-3.5)

---

### Frontend

#### React + TypeScript
**Why React?**
- Component reusability (FeedbackCard, UrgencyBadge, etc.)
- Excellent ecosystem for data visualization (Recharts, Chart.js)
- Fast development with Vite
- Strong TypeScript integration

**Project Structure:**
```
frontend/
├── src/
│   ├── pages/
│   │   ├── UrgentQueue.tsx       (PM view)
│   │   ├── VolumeAnalysis.tsx    (Support lead view)
│   │   ├── BugSearch.tsx         (Engineering view)
│   │   └── ExecutiveSummary.tsx  (Founder view)
│   ├── components/
│   │   ├── FeedbackCard.tsx
│   │   ├── UrgencyBadge.tsx
│   │   ├── CategoryPill.tsx
│   │   ├── TrendChart.tsx
│   │   └── FilterPanel.tsx
│   ├── hooks/
│   │   ├── useFeedback.ts
│   │   └── useInsights.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── feedback.types.ts
│   └── App.tsx
├── public/
└── package.json
```

#### Tailwind CSS
**Why Tailwind?**
- Rapid prototyping without context switching
- Consistent design system via utility classes
- Smaller bundle size than component libraries
- Easy responsive design (md:, lg: breakpoints)

**Component Example:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <div className="flex items-center justify-between">
    <UrgencyBadge score={85} />
    <CategoryPill category="Bug Report" />
  </div>
  <p className="mt-4 text-gray-700">{feedback.content}</p>
</div>
```

---

### Development Tools

#### TypeScript
- Shared types between frontend/backend (`types/` folder)
- Compile-time error catching
- Better IDE autocomplete

#### Vite (Frontend Build Tool)
- Lightning-fast HMR
- Optimized production builds
- Native ESM support

#### Prisma (ORM) - Optional
*Alternative to raw SQL:*
```typescript
const feedback = await prisma.feedback.findMany({
  where: { urgency_score: { gte: 70 } },
  include: { customer: true, category: true }
});
```

---

### Deployment

#### Vercel (Monorepo)
```
triage-system/
├── api/                 (NestJS backend)
│   └── index.ts        (Serverless function entry)
├── frontend/           (React app)
│   └── dist/          (Built static files)
├── vercel.json        (Routing config)
└── package.json
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/frontend/$1" }
  ]
}
```

#### Environment Variables
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# App
NODE_ENV=production
PORT=3000
```

---

## Implementation Phases

### Phase 1: Foundation & Architecture ✅ (Current)
**Deliverable:** `ARCHITECTURE.md` (this document)
- System design diagram
- Complete data model with ER diagram
- Prioritization algorithm specification
- API endpoint documentation
- Technology stack rationale

**Duration:** Completed

---

### Phase 2: Backend Implementation (Next)
**Deliverable:** Working NestJS API + Supabase database

#### Tasks:
1. **Project Setup**
   - Initialize NestJS project with TypeScript
   - Configure Supabase connection
   - Set up environment variables
   - Install dependencies (OpenAI SDK, validation pipes)

2. **Database Schema**
   - Create Supabase project
   - Write SQL migrations for tables (customers, feedback, categories, feedback_tags)
   - Create indexes for performance (on urgency_score, created_at, customer_id)
   - Seed categories with keywords

3. **Core Modules**
   - **Feedback Module**: CRUD operations, batch ingestion
   - **Customers Module**: Customer management
   - **Categories Module**: Category/keyword management
   - **Prioritization Module**: LLM integration for urgency scoring
   - **Insights Module**: Aggregation queries (urgent, trends, summary)

4. **Services Implementation**
   - `CategorizationService`: Keyword matching logic
   - `PrioritizationService`: OpenAI API integration
   - `SimilarityService`: Frequency detection SQL queries

5. **API Endpoints**
   - Implement all 7 endpoints from specification
   - Add validation (DTOs with class-validator)
   - Error handling middleware
   - Request logging

6. **Seed Data**
   - Generate 100 realistic feedback items
   - 30 customers (mix of tiers)
   - Cover all sources and categories
   - Ensure scenarios are testable (urgent bugs, trending features, etc.)

**Duration:** 3-4 hours

---

### Phase 3: Frontend Implementation
**Deliverable:** React dashboard with 4 key views

#### Tasks:
1. **Project Setup**
   - Initialize Vite + React + TypeScript
   - Configure Tailwind CSS
   - Set up routing (React Router)
   - Create API service layer (Axios/Fetch)

2. **Shared Components**
   - `FeedbackCard`: Display feedback with metadata
   - `UrgencyBadge`: Color-coded urgency indicator (red=90+, orange=70-89, yellow=50-69)
   - `CategoryPill`: Category badge with icon
   - `FilterPanel`: Reusable filter UI
   - `TrendChart`: Line/bar chart wrapper (Recharts)
   - `LoadingSpinner`, `ErrorMessage`

3. **Page 1: Urgent Queue (PM View)**
   - Display urgent items (score ≥70) from last 24h
   - Filters: category, customer tier
   - Actions: Mark as reviewed, view details
   - Sort by urgency score (default)

4. **Page 2: Volume Analysis (Support Lead View)**
   - Time-series chart (daily feedback count, last 7 days)
   - Pie chart: Category distribution
   - Breakdown by source
   - Comparison to previous week

5. **Page 3: Bug Search (Engineering View)**
   - Search bar with full-text search
   - Filters: category=bug, date range, customer tier
   - Group by frequency (show "5 similar reports")
   - Click to see similar feedback thread

6. **Page 4: Executive Summary (Founder View)**
   - KPI cards: Total feedback, NPS score, sentiment %
   - Top 3 categories chart
   - Critical issues table (top 5)
   - Highlights section (most requested feature, biggest pain point)

7. **Navigation & Layout**
   - Sidebar navigation between pages
   - Header with date/time picker
   - Responsive design (mobile-friendly)

**Duration:** 3-4 hours

---

### Phase 4: Polish & Deployment
**Deliverable:** Production-ready system on Vercel

#### Tasks:
1. **Testing**
   - Backend: Unit tests for services (Jest)
   - Backend: Integration tests for API endpoints (Supertest)
   - Frontend: Component tests (React Testing Library)
   - E2E test for critical flow (submit feedback → see in urgent queue)

2. **Documentation**
   - README.md with setup instructions
   - API documentation (Swagger/OpenAPI)
   - Architecture decisions record
   - Demo data walkthrough

3. **Error Handling**
   - Global exception filter (NestJS)
   - API rate limiting
   - OpenAI API fallback (if quota exceeded, use rule-based scoring)
   - Loading states and error messages in UI

4. **Performance Optimization**
   - Database query optimization (EXPLAIN ANALYZE)
   - API response caching (Redis or in-memory)
   - Frontend lazy loading
   - Image/asset optimization

5. **Deployment**
   - Configure Vercel project (monorepo)
   - Set environment variables
   - Deploy backend + frontend
   - Test production build
   - Set up custom domain (optional)

6. **Final Touches**
   - Code cleanup and linting
   - TypeScript strict mode check
   - Security audit (SQL injection prevention, XSS)
   - Accessibility improvements (ARIA labels, keyboard navigation)

**Duration:** 2-3 hours

---

## Success Metrics

### Assessment Evaluation Criteria

#### 1. Product Thinking (40%)
- ✅ Data model captures decision-making signals
- ✅ Prioritization logic is reasonable and explainable
- ✅ Dashboard addresses real user workflows
- ✅ Thoughtful trade-offs documented

#### 2. Backend Design (30%)
- ✅ Clean API design (RESTful, consistent)
- ✅ Handles varied input formats gracefully
- ✅ Smart categorization approach
- ✅ Extensible architecture

#### 3. Frontend Execution (20%)
- ✅ Information hierarchy is clear
- ✅ Smooth interactions for common actions
- ✅ Genuinely useful (not just functional)
- ✅ Responsive and performant

#### 4. Code Quality (10%)
- ✅ TypeScript type safety
- ✅ Modular, maintainable code
- ✅ Error handling
- ✅ Comments for complex logic

---

## Future Enhancements (Post-MVP)

### Short-term (1-2 weeks)
- [ ] **Duplicate detection**: ML-based semantic similarity (embeddings)
- [ ] **Sentiment analysis**: More nuanced than positive/neutral/negative
- [ ] **User authentication**: Multi-tenant support with Supabase Auth
- [ ] **Email notifications**: Alert on critical issues (score >90)
- [ ] **Feedback assignment**: Assign to PM/engineer, track resolution

### Mid-term (1-2 months)
- [ ] **Integrations**: Direct webhooks from Zendesk, Intercom, App Store Connect
- [ ] **Custom dashboards**: Users build their own views with drag-and-drop
- [ ] **Advanced analytics**: Cohort analysis, churn prediction from feedback
- [ ] **Collaboration**: Comments, internal notes on feedback items
- [ ] **SLA tracking**: Time-to-response, time-to-resolution metrics

### Long-term (3+ months)
- [ ] **ML categorization**: Train custom model on feedback history
- [ ] **Proactive insights**: "Checkout bugs spiking, likely caused by v2.1.0 deploy"
- [ ] **Customer 360**: Link feedback to CRM data (Salesforce, HubSpot)
- [ ] **Auto-routing**: Smart assignment to teams based on category/keywords
- [ ] **Public roadmap**: Surface top feature requests to customers (like Canny)

---

## Appendix

### A. Keyword Categorization Rules

```typescript
const CATEGORY_KEYWORDS = {
  bug: [
    'crash', 'error', 'broken', 'not working', 'bug', 'issue',
    'fails', 'freezes', 'stuck', 'glitch', '500', '404'
  ],
  feature: [
    'wish', 'would be nice', 'should add', 'feature request',
    'suggestion', 'can you', 'please add', 'missing', 'need'
  ],
  complaint: [
    'frustrated', 'angry', 'terrible', 'worst', 'disappointed',
    'useless', 'waste', 'slow', 'poor', 'bad experience'
  ],
  praise: [
    'love', 'great', 'amazing', 'awesome', 'excellent',
    'perfect', 'thank you', 'fantastic', 'best', 'wonderful'
  ],
  question: [
    'how do i', 'how to', 'can i', 'is it possible',
    'where is', 'what is', '?', 'help', 'confused'
  ]
};
```

### B. Sample Feedback Data

```typescript
const SAMPLE_FEEDBACK = [
  {
    source: 'support',
    content: 'Payment processing fails with error 500 when using Amex cards',
    customer_email: 'cto@enterprise-corp.com',
    customer_tier: 'enterprise',
    metadata: {
      ticket_id: 'TICKET-001',
      channel: 'email',
      assigned_agent: 'sarah@company.com'
    }
    // Expected: bug, urgency ~90 (enterprise + payment + error)
  },
  {
    source: 'nps',
    content: 'Love the new dashboard redesign! So much cleaner.',
    customer_email: 'user@startup.com',
    customer_tier: 'pro',
    metadata: {
      nps_score: 9,
      survey_campaign: 'Q1-2024'
    }
    // Expected: praise, urgency ~20 (positive feedback, low priority)
  },
  {
    source: 'appstore',
    content: 'App crashes every time I try to upload a photo',
    metadata: {
      store: 'ios',
      app_version: '2.1.0',
      star_rating: 1,
      reviewer_username: 'frustrated_user_123'
    }
    // Expected: bug, urgency ~75 (crash but no customer tier info)
  }
];
```

### C. Database Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_feedback_urgency_created ON feedback(urgency_score DESC, created_at DESC);
CREATE INDEX idx_feedback_category ON feedback(category_id);
CREATE INDEX idx_feedback_customer ON feedback(customer_id);
CREATE INDEX idx_feedback_source ON feedback(source);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_content_search ON feedback USING gin(to_tsvector('english', content));
```

### D. OpenAI API Configuration

```typescript
const OPENAI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.3,  // Low temperature for consistent scoring
  max_tokens: 200,   // Enough for score + reasoning
  response_format: { type: 'json_object' }
};
```

---

**Document Version:** 1.0
**Last Updated:** 2024-01-17
**Author:** Customer Feedback Triage System Team
**Status:** ✅ Approved - Ready for Implementation
