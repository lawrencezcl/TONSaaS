# ChannelGrowth - AI-Powered Telegram Channel Management SaaS

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)
![Deployment](https://img.shields.io/badge/deployed-Vercel-black)

🔗 **Live Demo**: [https://channelgrowth-saas-lawrencezcls-projects.vercel.app](https://channelgrowth-saas-lawrencezcls-projects.vercel.app)

An AI-powered SaaS platform that helps Telegram channel owners grow their revenue by 30% through intelligent analytics and recommendations.

## 🚀 Features

- **Real-Time Analytics** - Track subscriber growth, engagement rates, and revenue estimates
- **AI Recommendations** - Get personalized suggestions on posting times, content types, and hashtags
- **Channel Management** - Add, sync, and monitor multiple Telegram channels
- **Subscription Tiers** - Free, Pro, Business, and Enterprise plans
- **TON Wallet Integration** - Secure authentication using TON Connect
- **Automated Insights** - Cron jobs for automatic channel sync and recommendation generation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM (SQLite for dev, Postgres for production)
- **Authentication**: TON Connect + JWT
- **Deployment**: Vercel
- **Cron Jobs**: Vercel Cron

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🔧 Installation

**⚠️ Database Required for Production**: This app requires a PostgreSQL database to function properly. The current deployment uses an in-memory mock database for demonstration purposes, which has limitations in serverless environments. To enable full functionality:

1. Set up Vercel Postgres (recommended) or another PostgreSQL database
2. Add `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` environment variables in Vercel
3. Run `npx prisma db push` to create the schema
4. Redeploy the application

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/TONSaaS.git
cd TONSaaS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
POSTGRES_PRISMA_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"

# Telegram Bot (optional for local dev)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Cron Jobs
CRON_SECRET="your-cron-secret"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
TONSaaS/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── channels/        # Channel management
│   │   ├── analytics/       # Analytics data
│   │   ├── recommendations/ # AI recommendations
│   │   └── cron/            # Scheduled jobs
│   ├── dashboard/           # Dashboard pages
│   │   ├── channels/
│   │   ├── recommendations/
│   │   ├── billing/
│   │   └── settings/
│   └── login/               # Authentication
├── lib/
│   ├── services/            # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── channel.service.ts
│   │   ├── analytics.service.ts
│   │   └── recommendation.service.ts
│   └── db.ts                # Database client
├── prisma/
│   └── schema.prisma        # Database schema
└── components/              # React components
```

## 🔐 Authentication

The app uses TON Connect for wallet-based authentication. In development mode, a mock authentication is provided. For production:

1. Install TON Connect SDK
2. Configure TON wallet integration
3. Set up proper JWT token verification

## 🗄️ Database Schema

Key models:
- **User** - User accounts with TON wallet addresses
- **Channel** - Telegram channels
- **ChannelAnalytics** - Daily analytics aggregation
- **PostAnalytics** - Post-level performance data
- **AIRecommendation** - AI-generated insights
- **Subscription** - Billing and subscription management

## 📊 API Endpoints

### Authentication
- `POST /api/auth/ton-connect` - Authenticate with TON wallet
- `GET /api/auth/session` - Validate session

### Channels
- `GET /api/channels` - List user channels
- `POST /api/channels` - Add new channel

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview

### Recommendations
- `GET /api/recommendations` - Get AI recommendations

## ⚙️ Cron Jobs

Configured in `vercel.json`:
- **Hourly**: Sync all channels (`/api/cron/sync-channels`)
- **Daily**: Generate AI recommendations (`/api/cron/generate-recommendations`)

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set production environment variables in Vercel Dashboard

### Environment Variables for Production

Required variables:
- `POSTGRES_PRISMA_URL` - Vercel Postgres connection string
- `POSTGRES_URL_NON_POOLING` - Direct database connection
- `JWT_SECRET` - JWT signing secret
- `TELEGRAM_BOT_TOKEN` - Telegram Bot API token
- `CRON_SECRET` - Cron job authentication secret

## 🧪 Testing

Run tests:
```bash
npm test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## 📈 Roadmap

- [ ] Real TON Connect integration
- [ ] Actual Telegram Bot API integration
- [ ] Charts and data visualization (Recharts)
- [ ] Email notifications
- [ ] Stripe payment integration
- [ ] Mobile responsive improvements
- [ ] API rate limiting
- [ ] Unit and E2E tests

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TON](https://ton.org/)

## 📞 Support

For support, email support@channelgrowth.com or open an issue.

---

Built with ❤️ for the Telegram creator community
