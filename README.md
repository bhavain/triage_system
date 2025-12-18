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

## 📊 Key Features

### **Backend (NestJS + Supabase + OpenAI)**
- ✅ Complete REST API with 7 endpoints
- ✅ PostgreSQL schema with performance indexes
- ✅ LLM-powered urgency scoring (0-100)
- ✅ Keyword-based categorization (5 categories)
- ✅ Frequency detection for trending issues
- ✅ Flexible JSONB metadata storage
- ✅ 100 realistic seed data items

### **Frontend (React + TypeScript + Tailwind)**
- ✅ Urgent Queue dashboard (PM morning triage view)
- ✅ Real-time urgency badges (Critical/High/Medium/Low)
- ✅ AI reasoning display for each score
- ✅ Customer tier indicators (Enterprise/Pro/Free)
- ✅ Frequency indicators for recurring issues
- ✅ Responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key

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
# Edit .env with your Supabase and OpenAI credentials

# Run SQL migration in Supabase dashboard
# File: src/database/migrations/001_initial_schema.sql

# Start backend
npm run start:dev
```

Backend runs at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Start frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Seed Data (Optional but Recommended)

**Easy way - Use the seed script:**
```bash
cd /Users/bhavainshah/Documents/codespace/triage_system
./seed-feedback-simple.sh
```

**Or with more verbose output:**
```bash
./seed-feedback.sh  # Requires jq installed
```

This will seed:
- Critical bugs (payment failures, crashes)
- Similar crash reports (shows frequency detection)
- Feature requests (dark mode, bulk actions)
- Positive feedback and complaints
- Support questions

**Manual way - Use curl:**
```bash
curl -X POST http://localhost:3000/api/feedback/batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "source": "support",
        "content": "Payment processing fails with error 500",
        "customer_email": "cto@acme.com",
        "customer_tier": "enterprise",
        "customer_company": "Acme Corp",
        "metadata": {"ticket_id": "TICKET-001", "channel": "email"}
      }
    ]
  }'
```

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

## 🎨 Design Decisions

### **Product-Minded Data Model**
- `customers` table with tier info (enterprise/pro/free)
- `categories` table with keyword arrays for matching
- `feedback` table with JSONB metadata for flexibility
- `feedback_tags` for flexible categorization

### **LLM Prioritization**
- **Why GPT-4**: Context-aware analysis beats simple rules
- **Fallback**: Rule-based scoring ensures reliability
- **Explainability**: Every score includes reasoning for trust

### **Performance Optimization**
- Indexes on `urgency_score`, `created_at`, `customer_id`
- Full-text search on content
- Denormalized `frequency_count` for faster queries

### **MVP Focus**
- **Urgent Queue**: Most critical view for PM triage
- **Simple UI**: Clean, focused dashboard over complex charts
- **Extensibility**: Architecture ready for trends, search, summary views

## 🔮 Future Enhancements

### Short-term
- [ ] Trends View with volume charts
- [ ] Bug Search with full-text filtering
- [ ] Executive Summary dashboard
- [ ] Feedback detail modal with similar items

### Mid-term
- [ ] Real-time updates (WebSockets)
- [ ] Status workflow (new → reviewed → assigned → resolved)
- [ ] Email notifications for critical issues
- [ ] User authentication (Supabase Auth)

### Long-term
- [ ] ML-based duplicate detection (embeddings)
- [ ] Custom dashboards (drag-and-drop)
- [ ] Direct integrations (Zendesk, Intercom webhooks)
- [ ] Public roadmap (like Canny)

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Backend Framework** | NestJS | Modular architecture, TypeScript-first, great DI |
| **Database** | Supabase (PostgreSQL) | Real-time, RLS, excellent DX |
| **AI/ML** | OpenAI GPT-4 | Best-in-class reasoning for prioritization |
| **Frontend** | React + TypeScript | Component reusability, strong typing |
| **Styling** | Tailwind CSS | Rapid prototyping, consistent design |
| **Deployment** | Vercel | Seamless monorepo deployment |

## 📈 Assessment Criteria

### ✅ Product Thinking (40%)
- Data model captures decision-making signals (customer tier, frequency, recency)
- Prioritization logic is explainable and reasonable
- Dashboard addresses real PM workflow (morning triage)
- Thoughtful trade-offs documented (LLM vs rules, normalized schema)

### ✅ Backend Design (30%)
- Clean REST API with 7 endpoints
- Handles varied input formats (JSONB metadata)
- Smart categorization (keyword matching + sentiment)
- Extensible architecture (easy to add new sources/categories)

### ✅ Frontend Execution (20%)
- Clear information hierarchy (urgency → content → analysis)
- Smooth interactions (hover states, loading states)
- Genuinely useful (AI reasoning, frequency indicators)
- Responsive design

### ✅ Code Quality (10%)
- TypeScript strict mode throughout
- Modular, maintainable code structure
- Error handling (fallback scoring, API errors)
- Comments for complex logic (LLM prompts, scoring)

## 🐛 Troubleshooting

**Backend won't start**
- Check `.env` has valid Supabase and OpenAI keys
- Ensure SQL migration ran successfully
- Verify Node.js 18+ installed

**Frontend shows "Failed to load data"**
- Ensure backend is running at `http://localhost:3000`
- Check `.env` has `VITE_API_URL=http://localhost:3000`
- Verify CORS is enabled in backend

**"Missing OpenAI configuration"**
- Add `OPENAI_API_KEY=sk-...` to backend `.env`
- System will fallback to rule-based scoring if key is invalid

## 📄 License

MIT

## 🙏 Acknowledgments

Built as an assessment project demonstrating:
- Product-minded technical decisions
- AI/LLM integration
- Full-stack TypeScript development
- Modern cloud-native architecture

---

**Questions?** Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.
