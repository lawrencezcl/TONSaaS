# Technical Specification: AI-Powered Telegram Channel Management SaaS

## Tech Stack (Vercel-Optimized)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts (React-based charting)
- **State Management**: React Server Components + Zustand (client state)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: TON Connect (@tonconnect/ui-react)

### Backend/API
- **API Layer**: Next.js API Routes (App Router)
- **Runtime**: Vercel Edge Functions + Node.js Serverless
- **ORM**: Prisma (with edge-compatible client)
- **Database**: Vercel Postgres (Neon PostgreSQL)
- **Cache**: Vercel KV (Redis)
- **Queue**: Vercel Cron Jobs + Upstash QStash
- **File Storage**: Vercel Blob Storage

### Analytics & AI
- **ML Engine**: Python (via Vercel Serverless Functions)
- **Libraries**: pandas, scikit-learn, XGBoost
- **Telegram API**: node-telegram-bot-api
- **Data Pipeline**: Inngest (serverless workflow)

### Blockchain Integration
- **TON Payments**: @ton/ton, @ton/crypto
- **Wallet Integration**: TON Connect SDK
- **0G Storage**: 0G Storage SDK (for historical data)
- **0G Compute**: 0G Compute API (for ML inference)

### DevOps & Deployment
- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration
- **Monitoring**: Vercel Analytics + Sentry
- **Logging**: Vercel Logs + Axiom

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  Next.js 14 + shadcn/ui + TailwindCSS + TON Connect         │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Edge Network (CDN)                       │
│  • Static Assets  • ISR Cache  • Edge Middleware            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Next.js App Router (Vercel Functions)              │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   API Routes │  │   Server    │  │   Cron Jobs │        │
│  │   /api/*     │  │  Components │  │   Hourly    │        │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │                │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Vercel    │  │   Vercel    │  │  Telegram   │        │
│  │  Postgres   │  │     KV      │  │   Bot API   │        │
│  │  (Primary)  │  │   (Cache)   │  │  (External) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ 0G Storage  │  │ 0G Compute  │                          │
│  │ (Historical)│  │ (ML Models) │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  • TON Blockchain  • Inngest  • Sentry  • Axiom            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Prisma)

### Core Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

// User & Authentication
model User {
  id                   String      @id @default(cuid())
  tonAddress           String      @unique @map("ton_address")
  email                String?     @unique
  subscriptionTier     String      @default("free") @map("subscription_tier")
  subscriptionEndDate  DateTime?   @map("subscription_end_date")
  stripeCustomerId     String?     @unique @map("stripe_customer_id")
  createdAt            DateTime    @default(now()) @map("created_at")
  updatedAt            DateTime    @updatedAt @map("updated_at")
  
  channels             Channel[]
  subscriptions        Subscription[]
  
  @@map("users")
}

// Telegram Channels
model Channel {
  id                 String      @id @default(cuid())
  userId             String      @map("user_id")
  telegramChannelId  String      @unique @map("telegram_channel_id")
  channelName        String      @map("channel_name")
  channelUsername    String?     @map("channel_username")
  subscriberCount    Int         @default(0) @map("subscriber_count")
  niche              String?
  isActive           Boolean     @default(true) @map("is_active")
  lastSyncAt         DateTime?   @map("last_sync_at")
  createdAt          DateTime    @default(now()) @map("created_at")
  updatedAt          DateTime    @updatedAt @map("updated_at")
  
  user               User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  analytics          ChannelAnalytics[]
  posts              PostAnalytics[]
  recommendations    AIRecommendation[]
  
  @@index([userId])
  @@index([telegramChannelId])
  @@map("channels")
}

// Daily Analytics Aggregation
model ChannelAnalytics {
  id                  String      @id @default(cuid())
  channelId           String      @map("channel_id")
  date                DateTime    @db.Date
  subscriberCount     Int         @map("subscriber_count")
  newSubscribers      Int         @default(0) @map("new_subscribers")
  postsCount          Int         @default(0) @map("posts_count")
  totalViews          Int         @default(0) @map("total_views")
  totalReactions      Int         @default(0) @map("total_reactions")
  engagementRate      Float       @default(0) @map("engagement_rate")
  estimatedAdRevenue  Float       @default(0) @map("estimated_ad_revenue")
  createdAt           DateTime    @default(now()) @map("created_at")
  
  channel             Channel     @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  @@unique([channelId, date])
  @@index([channelId, date])
  @@map("channel_analytics")
}

// Post-Level Analytics
model PostAnalytics {
  id                 String      @id @default(cuid())
  channelId          String      @map("channel_id")
  telegramMessageId  String      @map("telegram_message_id")
  postDate           DateTime    @map("post_date")
  contentType        String      @map("content_type")
  postLength         Int         @default(0) @map("post_length")
  hasMedia           Boolean     @default(false) @map("has_media")
  views              Int         @default(0)
  reactions          Int         @default(0)
  shares             Int         @default(0)
  forwards           Int         @default(0)
  engagementRate     Float       @default(0) @map("engagement_rate")
  hashtags           String[]
  createdAt          DateTime    @default(now()) @map("created_at")
  
  channel            Channel     @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  @@unique([channelId, telegramMessageId])
  @@index([channelId, postDate])
  @@map("post_analytics")
}

// AI Recommendations
model AIRecommendation {
  id                       String      @id @default(cuid())
  channelId                String      @map("channel_id")
  recommendationType       String      @map("recommendation_type")
  title                    String
  description              String      @db.Text
  confidenceScore          Float       @map("confidence_score")
  expectedImpactPercentage Int         @map("expected_impact_percentage")
  isActive                 Boolean     @default(true) @map("is_active")
  isDismissed              Boolean     @default(false) @map("is_dismissed")
  createdAt                DateTime    @default(now()) @map("created_at")
  
  channel                  Channel     @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  @@index([channelId, createdAt])
  @@map("ai_recommendations")
}

// Subscriptions & Billing
model Subscription {
  id              String      @id @default(cuid())
  userId          String      @map("user_id")
  plan            String
  monthlyPrice    Float       @map("monthly_price")
  status          String      @default("active")
  tonTxHash       String?     @unique @map("ton_tx_hash")
  stripeSubId     String?     @unique @map("stripe_subscription_id")
  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd   DateTime @map("current_period_end")
  cancelAtPeriodEnd  Boolean  @default(false) @map("cancel_at_period_end")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("subscriptions")
}
```

---

## API Routes Structure

### File Structure
```
app/
├── api/
│   ├── auth/
│   │   ├── ton-connect/route.ts      # TON wallet verification
│   │   └── session/route.ts           # Session management
│   ├── channels/
│   │   ├── route.ts                   # GET, POST channels
│   │   ├── [id]/route.ts              # GET, PATCH, DELETE channel
│   │   ├── [id]/analytics/route.ts    # GET analytics data
│   │   └── [id]/sync/route.ts         # POST manual sync
│   ├── analytics/
│   │   ├── dashboard/route.ts         # GET dashboard overview
│   │   └── export/route.ts            # POST export data
│   ├── recommendations/
│   │   ├── route.ts                   # GET all recommendations
│   │   ├── [id]/dismiss/route.ts      # POST dismiss recommendation
│   │   └── generate/route.ts          # POST trigger AI generation
│   ├── subscriptions/
│   │   ├── route.ts                   # GET user subscriptions
│   │   ├── create/route.ts            # POST create subscription
│   │   ├── cancel/route.ts            # POST cancel subscription
│   │   └── webhooks/
│   │       ├── ton/route.ts           # POST TON payment webhook
│   │       └── stripe/route.ts        # POST Stripe webhook
│   └── cron/
│       ├── sync-channels/route.ts     # Hourly channel sync
│       └── generate-recs/route.ts     # Daily recommendation generation
```

### Key Endpoints

#### Authentication
```typescript
// app/api/auth/ton-connect/route.ts
POST /api/auth/ton-connect
Body: { proof: TonProof, tonAddress: string }
Response: { token: string, user: User }
```

#### Channels
```typescript
// app/api/channels/route.ts
GET /api/channels
Query: { page, limit }
Response: { channels: Channel[], total: number }

POST /api/channels
Body: { telegramChannelId: string }
Response: { channel: Channel }

// app/api/channels/[id]/analytics/route.ts
GET /api/channels/[id]/analytics
Query: { startDate, endDate, granularity }
Response: { analytics: ChannelAnalytics[] }
```

#### Recommendations
```typescript
// app/api/recommendations/route.ts
GET /api/recommendations
Query: { channelId?, isActive }
Response: { recommendations: AIRecommendation[] }

// app/api/recommendations/generate/route.ts
POST /api/recommendations/generate
Body: { channelId: string }
Response: { recommendations: AIRecommendation[] }
```

---

## Cron Jobs (Vercel Cron)

### Configuration
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-channels",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-recs",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Implementation
```typescript
// app/api/cron/sync-channels/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Sync all active channels
  const channels = await prisma.channel.findMany({
    where: { isActive: true }
  });

  for (const channel of channels) {
    await syncChannelData(channel);
  }

  return Response.json({ synced: channels.length });
}
```

---

## Environment Variables

```bash
# Database
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Redis Cache
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Telegram Bot
TELEGRAM_BOT_TOKEN="..."

# TON Blockchain
TON_API_KEY="..."
TON_WALLET_ADDRESS="..."

# 0G Network
ZEROG_STORAGE_API_URL="..."
ZEROG_COMPUTE_API_KEY="..."

# Authentication
JWT_SECRET="..."
NEXTAUTH_SECRET="..."

# Payments (optional fallback)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Monitoring
SENTRY_DSN="..."
AXIOM_TOKEN="..."

# Cron Security
CRON_SECRET="..."
```

---

## Performance Optimizations

### 1. Edge Caching
- Use Next.js ISR for dashboard pages
- Cache API responses in Vercel KV (5-minute TTL)
- Edge middleware for auth verification

### 2. Database Optimization
- Indexes on frequently queried fields
- Materialized views for complex analytics
- Connection pooling via Prisma

### 3. Image Optimization
- Next.js Image component for avatars
- Vercel Blob for channel media
- Lazy loading for charts

### 4. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting (automatic)
- Lazy load AI recommendation components

---

## Security Measures

### 1. Authentication
- TON wallet signature verification
- JWT with short expiration (1h)
- Refresh token rotation

### 2. API Protection
- Rate limiting (Vercel Edge Config)
- CORS configuration
- Input validation (Zod schemas)

### 3. Data Privacy
- Row-level security (RLS)
- Encrypted sensitive fields
- GDPR compliance (data export/deletion)

### 4. Payment Security
- Webhook signature verification
- Idempotency keys
- Transaction logging

---

## Monitoring & Logging

### Metrics to Track
- API response times
- Database query performance
- Cron job success rate
- User engagement (dashboard views, feature usage)
- Subscription conversion rates
- Churn rate

### Error Tracking
- Sentry for runtime errors
- Vercel Logs for request logs
- Axiom for structured logging

### Alerts
- Failed cron jobs
- High error rates (>1%)
- Payment failures
- Database connection issues

---

## Deployment Strategy

### Environments
1. **Development**: Local + Vercel Preview
2. **Staging**: Vercel Preview (branch: `staging`)
3. **Production**: Vercel Production (branch: `main`)

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
```

### Deployment Checklist
- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Test payment webhooks
- [ ] Verify cron jobs
- [ ] Check monitoring dashboards
- [ ] Deploy to production
- [ ] Smoke test critical flows

---

This technical specification provides the foundation for building a scalable, production-ready SaaS application using Vercel's ecosystem.
