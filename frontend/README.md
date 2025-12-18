# Customer Feedback Triage System - Frontend

React + TypeScript + Vite + Tailwind CSS dashboard for viewing prioritized customer feedback.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- Backend API running at `http://localhost:3000`

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📊 Features

### Urgent Queue Dashboard
- Real-time display of high-priority feedback (urgency score ≥ 70)
- Summary cards showing critical (90+) and high (70-89) priority items
- AI-powered urgency analysis with explanations
- Customer tier badges (Enterprise, Pro, Free)
- Frequency indicators for recurring issues

### Smart Prioritization
Each feedback item shows:
- **Urgency Badge**: Color-coded score (Critical/High/Medium/Low)
- **AI Reasoning**: Why this item was prioritized
- **Customer Tier**: Enterprise/Pro/Free
- **Category**: Bug/Feature/Complaint/Praise/Question
- **Frequency**: Number of similar reports
- **Timestamp**: When feedback was received

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation (ready for expansion)
- **Recharts** - Charts (ready for trends view)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── UrgencyBadge.tsx
│   ├── services/        # API integration
│   │   └── api.ts
│   ├── types/           # TypeScript definitions
│   │   └── feedback.ts
│   ├── App.tsx          # Main dashboard
│   └── main.tsx         # Entry point
├── .env                 # Environment variables
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variable in Vercel dashboard:
- `VITE_API_URL=https://your-backend-api.vercel.app`

## 📈 Future Enhancements

- **Trends View**: Volume analysis with charts
- **Bug Search**: Full-text search and filtering
- **Executive Summary**: KPIs and metrics
- **Feedback Details**: Modal with similar feedback thread
- **Status Updates**: Mark as reviewed/assigned
- **Real-time Updates**: WebSocket integration

## 🐛 Troubleshooting

**Error: Failed to load data**
- Make sure backend is running at `http://localhost:3000`
- Check `.env` file has correct `VITE_API_URL`

**CORS Error**
- Backend has CORS enabled by default for development
- For production, update backend CORS settings

---

Built with React • Vite • Tailwind CSS
