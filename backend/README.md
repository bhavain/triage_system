# Customer Feedback Triage System - Backend API

NestJS backend with Supabase PostgreSQL and OpenAI-powered prioritization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Supabase and OpenAI credentials
```

3. **Set up database**
- Go to your Supabase SQL Editor
- Run `src/database/migrations/001_initial_schema.sql`

4. **Start server**
```bash
npm run start:dev
```

Server runs at `http://localhost:3000`

## 📊 Key API Endpoints

- `POST /api/feedback/batch` - Ingest feedback (auto-categorizes & prioritizes)
- `GET /api/feedback` - List feedback with filters
- `GET /api/insights/urgent` - Get urgent queue (PM view)
- `GET /api/insights/trends` - Get trends analysis (Support view)
- `GET /api/insights/summary` - Get executive summary

## 🧠 How It Works

1. **Feedback ingested** → Keyword-based categorization
2. **OpenAI analyzes** → Urgency score (0-100) based on:
   - Customer tier (30%)
   - Severity (25%)
   - Frequency (20%)
   - Recency (15%)
   - Business impact (10%)
3. **Dashboard displays** → Actionable insights

## 📚 Full Documentation

See [ARCHITECTURE.md](../ARCHITECTURE.md) for complete API spec and system design.

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

---

Built with [NestJS](https://nestjs.com/) • [Supabase](https://supabase.com/) • [OpenAI](https://openai.com/)
