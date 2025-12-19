# Customer Feedback Triage System

AI-powered customer feedback prioritization system built for the assessment. Ingests feedback from multiple channels, automatically categorizes and prioritizes using OpenAI GPT-4, and surfaces actionable insights through an intelligent dashboard.

## 🎯 Problem Statement

Companies receive customer feedback from multiple sources (support tickets, NPS surveys, app store reviews, social mentions). Product and support teams are drowning in unstructured feedback and need a system to help them quickly identify what matters, spot trends, and route issues to the right people.

## ✨ Solution Highlights

### **Intelligent Prioritization**
- **LLM-Powered Scoring**: OpenAI GPT-4 analyzes feedback considering customer value (30%), severity (25%), frequency (20%), recency (15%), and business impact (10%)
- **Explainable AI**: Every urgency score comes with human-readable reasoning
- **Fallback Logic**: Rule-based scoring ensures system works even if OpenAI is unavailable

### **Smart Categorization**
- **Keyword Matching**: Automatic categorization into Bug Report, Feature Request, Complaint, Praise, Question
- **Sentiment Analysis**: Detects positive, neutral, negative sentiment
- **Frequency Detection**: Identifies trending issues with multiple reports

### **Multi-Channel Support**
- **Flexible Ingestion**: Handles support tickets, NPS surveys, app reviews, social mentions
- **Metadata Preservation**: JSONB storage keeps source-specific data (NPS scores, star ratings, etc.)
- **Batch Processing**: Efficient API for ingesting multiple feedback items

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        FEEDBACK SOURCES                  │
│  Support │ NPS │ App Store │ Social     │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  NestJS API     │
         │  - Validation   │
         │  - Processing   │
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐   ┌───▼────┐  ┌───▼────┐
│OpenAI │   │Keyword │  │Similar │
│ GPT-4 │   │Matching│  │ Detect │
└───┬───┘   └───┬────┘  └───┬────┘
    │            │            │
    └────────────┼────────────┘
                 │
         ┌───────▼─────────┐
         │   PostgreSQL    │
         │   (Supabase)    │
         └───────┬─────────┘
                 │
         ┌───────▼─────────┐
         │  React Dashboard│
         │  Urgent Queue   │
         └─────────────────┘
```

## 📊 Key Features Implemented

### **Backend (NestJS + Supabase + OpenAI)**
- ✅ **Complete REST API** with 7 endpoints (feedback, insights)
- ✅ **PostgreSQL schema** with performance indexes on urgency_score, created_at, customer_id
- ✅ **LLM-powered urgency scoring** (0-100) with GPT-4 + rule-based fallback
- ✅ **Keyword-based categorization** into 5 categories (Bug, Feature, Complaint, Praise, Question)
- ✅ **Frequency detection** for trending issues using content similarity
- ✅ **Multi-stage processing pipeline** with batch OpenAI calls (10 items per batch)
- ✅ **Sentiment analysis** (positive/neutral/negative)
- ✅ **Customer tier prioritization** (Enterprise > Pro > Free)

### **Frontend (React + TypeScript + Tailwind + Recharts)**
- ✅ **Urgent Queue dashboard** (PM morning triage view) - 7 high-priority items
- ✅ **Volume Analysis dashboard** (Support view) - trends, charts, category breakdown
- ✅ **Bug Search dashboard** (Engineering view) - advanced filters, pagination (50 of 151 results)
- ✅ **Executive Summary dashboard** (Executive view) - KPIs, sentiment, critical issues

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key with GPT-4 access

### 1. Clone & Setup

```bash
cd triage_system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Run Database Migration:**

1. Go to your Supabase dashboard → SQL Editor
2. Copy the contents of `backend/src/database/migrations/001_initial_schema.sql`
3. Paste and run the SQL migration
4. Verify tables created: `customers`, `categories`, `feedback`, `feedback_tags`

**Start Backend:**
```bash
npm run start:dev
```

Backend runs at `http://localhost:3000`

**Verify Backend:**
```bash
curl http://localhost:3000
# Should return: {"message":"Customer Feedback Triage System API","version":"1.0.0"}
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Configure API URL (usually no changes needed for local dev)
# Edit .env if needed:
echo "VITE_API_URL=http://localhost:3000" > .env

# Start frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Seed Data

**Recommended - Use the comprehensive seed script:**
```bash
cd backend
npx tsx scripts/seed-via-api.ts
```

This seeds **43 realistic feedback items** including:
- **15 Support Tickets**: Critical bugs, feature requests, questions (various severities)
- **11 NPS Surveys**: Range of scores (1-10) with detailed feedback
- **9 App Store Reviews**: iOS and Android reviews with star ratings (1-5)
- **8 Social Mentions**: Twitter, Reddit, LinkedIn posts
- **Coverage**: All customer tiers (Enterprise, Pro, Free)
- **Demonstrates**: Frequency detection, urgency scoring, sentiment analysis

**Alternative - Manual API Testing:**
```bash
curl -X POST http://localhost:3000/api/feedback/batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "content": "CRITICAL: Payment gateway is down! All transactions failing.",
        "customer_email": "cto@acme.com",
        "customer_tier": "enterprise",
        "customer_company": "Acme Corp",
        "ticket_id": "TICK-001",
        "channel": "email"
      }
    ]
  }'
```

### 5. Explore the Dashboard

Visit `http://localhost:5173` and explore:

1. **🚨 Urgent Queue (PM View)**: High-priority items requiring immediate attention
2. **📊 Volume Analysis (Support View)**: Feedback trends and category distribution
3. **🔍 Bug Search (Engineering View)**: Advanced filtering and search
4. **📈 Executive Summary (Executive View)**: High-level KPIs and insights

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system design, data model, API specs
- **[backend/README.md](./backend/README.md)** - Backend setup and API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend setup and features

## 🧪 Testing the System

### 1. Run the SQL Migration
In Supabase SQL Editor, run:
```sql
-- Content from backend/src/database/migrations/001_initial_schema.sql
```

### 2. Seed Data
```bash
./seed-feedback-simple.sh
```

### 3. View Dashboard
Visit `http://localhost:5173` to see the urgent queue with:
- Summary cards (Total Urgent, Critical, High Priority)
- Prioritized feedback items with AI analysis
- Customer tier and category badges
- Frequency indicators

## 📊 API Endpoints

### Feedback Management
- `POST /api/feedback/batch` - Ingest feedback (auto-categorizes & prioritizes)
- `GET /api/feedback` - List feedback with filters
- `GET /api/feedback/:id` - Get single feedback
- `PATCH /api/feedback/:id` - Update feedback status

### Insights & Analytics
- `GET /api/insights/urgent` - Urgent queue (min_urgency=70, last 24h)
- `GET /api/insights/trends` - Volume analysis and trends
- `GET /api/insights/summary` - Executive summary with KPIs

## 🎨 API Design Decisions

### **1. Flexible Batch Ingestion Endpoint**

**Decision**: Single `POST /api/feedback/batch` endpoint handles all feedback sources

**Rationale**:
- **Payload Normalization**: Different sources have different shapes (NPS has `nps_score`, App Store has `star_rating`, Support has `ticket_id`). Rather than forcing a rigid schema, we use a flexible approach where source-specific fields are automatically detected and normalized.
- **JSONB Metadata**: All source-specific data is preserved in a `metadata` JSONB column, allowing backward compatibility when adding new sources.
- **Batch Processing**: Processing 10-100 items at once is more efficient than individual requests, especially for OpenAI API calls.

**Example Payload Shapes**:
```javascript
// Support Ticket
{
  "content": "Payment gateway down",
  "ticket_id": "TICK-001",
  "channel": "email",
  "customer_email": "ceo@acme.com",
  "customer_tier": "enterprise"
}

// NPS Survey
{
  "content": "Love the product!",
  "nps_score": 9,
  "survey_campaign": "Q1-2024",
  "customer_email": "user@company.com"
}

// App Store Review
{
  "content": "App crashes on startup",
  "store": "ios",
  "star_rating": 1,
  "app_version": "4.1.0",
  "reviewer_username": "angry_user"
}
```

### **2. Multi-Stage Processing Pipeline**

**Decision**: Feedback processing happens in 5 sequential stages

**Pipeline**:
1. **Stage 0: Payload Normalization** - Detect source type, extract metadata
2. **Stage 1: Category Fetching** - Load category keywords for matching
3. **Stage 2: Customer + Categorization** - Upsert customer, match categories, detect similar feedback
4. **Stage 3: Urgency Scoring** - Batch call to OpenAI GPT-4 (10 items at a time)
5. **Stage 4-5: Persistence** - Bulk insert feedback and tags

**Rationale**:
- **Batching**: OpenAI calls are expensive and slow. Batching 10 items reduces API calls by 10x and costs significantly.
- **Parallel Processing**: Within each stage, independent operations run in parallel (Promise.all).
- **Observability**: Each stage logs progress, making debugging easy.
- **Error Isolation**: Failures in one stage don't crash the entire batch.

### **3. Frequency Detection via Content Similarity**

**Decision**: Use fuzzy string matching to detect similar feedback

**Implementation**:
```typescript
// Check last 30 days for similar content
const similar = await supabase
  .from('feedback')
  .select('content')
  .gte('created_at', thirtyDaysAgo)
  .ilike('content', `%${keywords}%`);
```

**Rationale**:
- **Simple & Fast**: PostgreSQL ILIKE with keyword extraction works well for MVP.
- **Good Enough**: Detects exact duplicates and close matches without complex ML.
- **Future-Ready**: Can upgrade to embedding-based similarity (pgvector) later.

**Alternative Considered**: Semantic similarity with embeddings (rejected for MVP due to complexity).

### **4. Hybrid Urgency Scoring (LLM + Rules)**

**Decision**: GPT-4 primary, rule-based fallback

**LLM Scoring**:
```typescript
const prompt = `Analyze urgency (0-100) based on:
- Customer Value: Enterprise(30) > Pro(20) > Free(10)
- Severity: Critical(25) > Major(15) > Minor(5)
- Frequency: Multiple reports add urgency
- Recency: Recent feedback is more urgent
- Business Impact: Revenue, security, compliance`;
```

**Fallback Scoring** (when OpenAI fails):
```typescript
score = customerTierScore + severityScore + frequencyScore + recencyScore + businessImpactScore
```

**Rationale**:
- **LLM Advantages**: Context-aware, nuanced reasoning, handles edge cases.
- **Reliability**: System works even if OpenAI is down or rate-limited.
- **Cost Control**: Batch processing reduces API costs by 10x.
- **Explainability**: Every score includes human-readable reasoning.

### **5. RESTful API Design**

**Endpoints**:
- `POST /api/feedback/batch` - Ingest feedback (idempotent via deduplication)
- `GET /api/feedback` - List with pagination, filtering, sorting
- `GET /api/feedback/:id` - Get single feedback with relationships
- `GET /api/insights/urgent` - Urgent queue (min_urgency=70, last 24h)
- `GET /api/insights/trends` - Volume trends, category distribution
- `GET /api/insights/summary` - Executive KPIs

**Design Principles**:
- **Resource-oriented**: Nouns for endpoints (`/feedback`, `/insights`)
- **Standard HTTP verbs**: GET, POST
- **Pagination**: `page`, `limit` query params
- **Filtering**: Query params for filters (`min_urgency`, `category`, `tier`)
- **Consistent responses**: `{ data: [...], pagination: {...} }`

**What I'd Change**: Add `PUT /api/feedback/:id/status` for status transitions with validation.

## 🎯 Approach to Example Scenarios

### **Scenario 1: PM Morning Triage**

**User Story**: "As a PM, I start my day checking the urgent queue to see what needs immediate attention."

**Implementation**:
- **Urgent Queue Dashboard** (`/api/insights/urgent`)
  - Filters: `min_urgency >= 70`, `created_at >= last 24 hours`
  - Sorting: Urgency score descending
  - Display: Summary cards (Total Urgent, Critical 90+, High 70-89)

**Key Features**:
- **AI Reasoning Badges**: Each item shows WHY it's urgent (e.g., "enterprise customer, revenue-affecting, 3 similar reports")
- **Frequency Indicators**: "3 similar reports" badge alerts PM to trending issues
- **Customer Context**: Tier badge (Enterprise/Pro/Free) and company name immediately visible
- **Action-Oriented**: "View More" button shows full context and similar feedback

**Real Data Example**:
```
CRITICAL (85) - ENTERPRISE - Bug Report
"Payment gateway down! All transactions failing with 503 errors."
→ AI Analysis: "Enterprise customer, revenue-affecting issue, 3 similar reports"
→ 3 similar reports | sarah.chen@techcorp.com | 12/18/2025 4:20 PM
```

### **Scenario 2: Support Team Volume Analysis**

**User Story**: "As a support lead, I want to understand what's driving ticket volume this week."

**Implementation**:
- **Volume Analysis Dashboard** (`/api/insights/trends`)
  - Time-based filters: Day, Week, Month, Quarter
  - Charts: Volume over time, category distribution, feedback by source
  - Tables: Category breakdown with trends

**Key Features**:
- **Trend Detection**: Percentage change vs previous period (↑ 530.8%)
- **Category Distribution**: Visual breakdown showing Bug Report (20%), Feature Request (12%), etc.
- **Source Analysis**: Bar chart showing support (30), nps (11), appstore (9), social (8)
- **Top Trending Issues**: Lists most frequent issues with counts

**Insight Example**:
```
Total Volume: 82 (↑ 530.8% vs previous period)
Top Issue: "uncategorized" - 26 reports
Second: "Bug Report" - 16 reports (20%)
```

### **Scenario 3: Engineering Bug Search**

**User Story**: "As an engineer, I want to search for all crash-related feedback from enterprise customers."

**Implementation**:
- **Bug Search & Analysis** (`/api/feedback` with filters)
  - Search: Full-text search on content
  - Filters: Category, Customer Tier, Min Urgency, Sort By
  - Results: Paginated list (50 per page) with full context

**Key Features**:
- **Advanced Filtering**: Category (Bug Report), Tier (Enterprise), Min Urgency (Critical 90+)
- **Search**: Keyword search in feedback content
- **Batch Results**: Shows 50 of 151 results with pagination
- **AI Context**: Each result includes AI analysis explaining urgency

**Query Example**:
```
Filters: Category=Bug Report, Tier=Enterprise, Min Urgency=70+
Results: 30 items found
Top Result: "Login system down for 3 hours" (Critical 100)
```

### **Scenario 4: Executive Summary**

**User Story**: "As an executive, I want a high-level view of customer sentiment and critical issues."

**Implementation**:
- **Executive Summary** (`/api/insights/summary`)
  - KPIs: Total Feedback, NPS Score, Response Rate, Avg Resolution Time
  - Sentiment: Pie chart (Positive 25, Neutral 45, Negative 32)
  - Critical Issues: Top 5 urgent items
  - Insights: Most requested feature, biggest pain point, customer praise

**Key Metrics**:
```
Total Feedback: 102
NPS Score: 16 (→ Stable)
Sentiment: 25 positive, 45 neutral, 32 negative

Critical Issues:
1. Payment gateway down (Urgent 100)
2. Database migration failed (Urgent 98)
3. API rate limiting broken (Urgent 92)

Most Requested: "dashboard, board, showing"
Biggest Pain Point: "performance, support, disappointed"
```

## What I'd Change With More Time

### **1. Enhanced Duplicate Detection (Week 1)**

**Current**: Simple keyword-based similarity using PostgreSQL ILIKE

**Improvement**: Semantic similarity with embeddings

**Benefits**:
- Detects similar feedback even with different wording
- "App crashes" matches "Application freezes" semantically
- More accurate grouping of related issues


### **2. Real-Time Updates (Week 1-2)**

**Current**: Manual refresh to see new feedback

**Improvement**: WebSocket connections for live updates

**Benefits**:
- PM sees urgent items appear instantly
- No need to refresh dashboard
- Toast notifications for critical items


### **3. Status Workflow & Assignment (Week 2)**

**Current**: All feedback is "new" status

**Improvement**: Full workflow state machine

**Benefits**:
- Track feedback through its lifecycle
- Assign to team members
- SLA tracking (time in each status)
- Analytics on resolution time


### **4. Smart Routing Rules (Week 2-3)**

**Current**: Manual review and assignment

**Improvement**: Auto-routing based on rules

**Benefits**:
- Critical issues automatically assigned
- Reduces manual triage time by 80%
- Ensures right team sees right feedback


### **5. Email & Slack Notifications (Week 3)**

**Current**: Must check dashboard manually

**Improvement**: Proactive notifications

**Benefits**:
- On-call team alerted instantly
- No need to monitor dashboard
- Reduces response time from hours to minutes


## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Backend Framework** | NestJS | Modular architecture, TypeScript-first, great DI |
| **Database** | Supabase (PostgreSQL) | Real-time, RLS, excellent DX |
| **AI/ML** | OpenAI GPT-4 | Best-in-class reasoning for prioritization |
| **Frontend** | React + TypeScript | Component reusability, strong typing |
| **Styling** | Tailwind CSS | Rapid prototyping, consistent design |
| **Charts** | Recharts | Beautiful, composable charts |
| **Deployment** | Vercel + Supabase | Seamless monorepo deployment |


## 📄 License

MIT

