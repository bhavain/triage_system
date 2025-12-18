# Quick Start Guide

Get the Customer Feedback Triage System running in 5 minutes!

## Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- OpenAI API key

## Step 1: Database Setup (2 minutes)

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Copy and paste the entire content of `backend/src/database/migrations/001_initial_schema.sql`
4. Click "Run"
5. You should see 4 tables created: `customers`, `categories`, `feedback`, `feedback_tags`

## Step 2: Backend Setup (1 minute)

```bash
cd backend
npm install
```

Edit `backend/.env`:
```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development
PORT=3000
```

Start backend:
```bash
npm run start:dev
```

You should see: `🚀 Application is running on: http://localhost:3000`

## Step 3: Frontend Setup (1 minute)

```bash
cd ../frontend
npm install
npm run dev
```

You should see: `Local: http://localhost:5173`

## Step 4: Seed Data (1 minute)

From the root directory:
```bash
./seed-feedback-simple.sh
```

You should see:
```
✅ Seeding complete!
📊 Seeded feedback includes:
   ✓ Critical payment & crash bugs (high urgency)
   ✓ Similar crash reports (frequency detection)
   ✓ Feature requests (dark mode, bulk actions)
   ...
```

## Step 5: View Dashboard

Open http://localhost:5173

You should see:
- 4 summary cards showing urgent items
- List of feedback with:
  - Red/Orange urgency badges (CRITICAL/HIGH)
  - Customer tier badges (ENTERPRISE/PRO/FREE)
  - AI reasoning for each score
  - Frequency indicators (🔥 3 similar reports)

## Troubleshooting

**Backend won't start:**
- Check `.env` has correct Supabase URL and keys
- Ensure SQL migration ran successfully

**Frontend shows "Failed to load data":**
- Make sure backend is running at `http://localhost:3000`
- Check browser console for errors

**"Missing OpenAI configuration":**
- Add valid `OPENAI_API_KEY` to `backend/.env`
- System will use fallback rule-based scoring if needed

## What's Next?

- View urgent queue with AI-powered prioritization
- Notice how similar crash reports are grouped with frequency count
- See enterprise customer feedback scored higher
- Check AI reasoning for each urgency score

## Architecture Overview

```
Frontend (React)         Backend (NestJS)           Services
    :5173          →        :3000           →     Supabase + OpenAI
                                                         ↓
                                                   PostgreSQL
                                                   (4 tables)
```

## Key Features to Test

1. **Urgency Scoring**: Critical bugs should score 85-95
2. **Frequency Detection**: Similar crash reports should show "🔥 X similar reports"
3. **Customer Tier**: Enterprise issues prioritized higher
4. **AI Reasoning**: Each item shows why it was prioritized
5. **Categorization**: Auto-categorized as Bug/Feature/Complaint/Praise/Question

---

That's it! You now have a fully functional AI-powered feedback triage system running locally. 🚀

For more details, see:
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
