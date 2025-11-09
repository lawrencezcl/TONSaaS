# Deployment Specification: AI-Powered Telegram Channel Management SaaS

## Deployment Strategy

### Platform: Vercel

**Why Vercel?**
- Zero-config Next.js deployment
- Automatic HTTPS and CDN
- Edge Network for global performance
- Built-in analytics and monitoring
- Serverless functions at scale
- Native Postgres, KV, and Blob storage

---

## Environment Setup

### 1. Development Environment

```bash
# Clone repository
git clone https://github.com/your-org/ton-saas.git
cd ton-saas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

**Local Development Stack**:
- Next.js dev server: `http://localhost:3000`
- Local Postgres (via Docker or Neon branch)
- Local Redis (via Upstash or Docker)

---

### 2. Staging Environment

**Purpose**: Pre-production testing

**Setup**:
```bash
# Create staging branch
git checkout -b staging

# Push to Vercel
vercel --prod --environment=staging
```

**Configuration**:
- Branch: `staging`
- Domain: `staging.channelgrowth.com`
- Database: Vercel Postgres (separate schema)
- Environment: Staging-specific env vars

---

### 3. Production Environment

**Purpose**: Live application

**Setup**:
```bash
# Deploy from main branch
git checkout main
vercel --prod
```

**Configuration**:
- Branch: `main`
- Domain: `app.channelgrowth.com`
- Database: Vercel Postgres (production)
- Environment: Production env vars

---

## Project Structure

```
ton-saas/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/          # Dashboard pages (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── channels/
│   │   ├── analytics/
│   │   ├── recommendations/
│   │   ├── settings/
│   │   └── billing/
│   ├── api/                  # API Routes
│   │   ├── auth/
│   │   ├── channels/
│   │   ├── analytics/
│   │   ├── recommendations/
│   │   ├── subscriptions/
│   │   └── cron/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # Dashboard-specific
│   ├── charts/               # Chart components
│   └── shared/               # Shared components
├── lib/                      # Utilities and services
│   ├── services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── channel.service.ts
│   │   ├── analytics.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── telegram.service.ts
│   │   └── subscription.service.ts
│   ├── db.ts                 # Prisma client
│   ├── redis.ts              # Redis client
│   ├── utils.ts              # Helper functions
│   └── validations/          # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/                   # Static assets
├── .env.example
├── .env.local (gitignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## Vercel Configuration

### vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["iad1", "sfo1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.channelgrowth.com"
  },
  "build": {
    "env": {
      "POSTGRES_PRISMA_URL": "@postgres-prisma-url",
      "POSTGRES_URL_NON_POOLING": "@postgres-url-non-pooling",
      "KV_REST_API_URL": "@kv-rest-api-url",
      "KV_REST_API_TOKEN": "@kv-rest-api-token"
    }
  },
  "crons": [
    {
      "path": "/api/cron/sync-channels",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-recommendations",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/process-renewals",
      "schedule": "0 0 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://app.channelgrowth.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Authorization, Content-Type"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "cookie",
          "key": "auth_token"
        }
      ],
      "destination": "/dashboard",
      "permanent": false
    }
  ]
}
```

---

## Environment Variables

### Required Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_URL="https://app.channelgrowth.com"
NEXT_PUBLIC_APP_NAME="ChannelGrowth"

# Database (Vercel Postgres)
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Cache (Vercel KV)
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://app.channelgrowth.com"

# Telegram Bot API
TELEGRAM_BOT_TOKEN="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"

# TON Blockchain
TON_API_KEY="your-ton-center-api-key"
TON_WALLET_ADDRESS="EQD7x...g8Hs"
TON_WALLET_MNEMONIC="word1 word2 ... word24"

# 0G Network
ZEROG_STORAGE_API_URL="https://..."
ZEROG_STORAGE_API_KEY="..."
ZEROG_COMPUTE_API_URL="https://..."
ZEROG_COMPUTE_API_KEY="..."

# Payments (Optional - Stripe fallback)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."
AXIOM_TOKEN="..."
AXIOM_DATASET="production"

# Cron Jobs
CRON_SECRET="your-cron-secret-key"

# Email (Optional - for notifications)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@channelgrowth.com"
```

### Setting Variables in Vercel

```bash
# Via CLI
vercel env add POSTGRES_PRISMA_URL production
vercel env add JWT_SECRET production
vercel env add TELEGRAM_BOT_TOKEN production
# ... etc

# Or via Vercel Dashboard
# Settings > Environment Variables
```

---

## Database Setup

### 1. Create Vercel Postgres Database

```bash
# Via Vercel CLI
vercel postgres create

# Link to project
vercel link
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations (for production)
npx prisma migrate deploy
```

### 3. Seed Initial Data (Optional)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample user
  const user = await prisma.user.create({
    data: {
      tonAddress: 'EQD7x...g8Hs',
      subscriptionTier: 'pro',
    },
  });

  console.log('Seeded user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# Run seed
npx prisma db seed
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Check TypeScript
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/staging'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

---

## Monitoring Setup

### 1. Vercel Analytics

**Setup**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Sentry Error Tracking

**Install**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configuration**:
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.VERCEL_ENV || 'development',
});
```

### 3. Axiom Logging

**Install**:
```bash
npm install next-axiom
```

**Configuration**:
```typescript
// lib/logger.ts
import { Logger } from 'next-axiom';

export const logger = new Logger({
  dataset: process.env.AXIOM_DATASET || 'development',
  token: process.env.AXIOM_TOKEN,
});
```

**Usage**:
```typescript
// app/api/channels/route.ts
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  logger.info('Fetching channels', { userId: 'user_123' });
  
  try {
    // ... logic
  } catch (error) {
    logger.error('Failed to fetch channels', { error });
  }
}
```

---

## Performance Optimization

### 1. Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['api.telegram.org', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Bundle analyzer (optional)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
```

### 2. Prisma Optimization

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3. Edge Middleware for Auth

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

---

## Backup and Disaster Recovery

### 1. Database Backups

**Vercel Postgres** provides automatic daily backups.

**Manual Backup**:
```bash
# Export database
pg_dump $POSTGRES_URL_NON_POOLING > backup-$(date +%Y%m%d).sql

# Restore
psql $POSTGRES_URL_NON_POOLING < backup-20241109.sql
```

### 2. Code Backups

**Git** serves as primary backup.

**GitHub Settings**:
- Enable branch protection on `main`
- Require pull request reviews
- Enable status checks

### 3. Environment Variables Backup

**Export all env vars**:
```bash
vercel env pull .env.backup
```

Store securely in password manager.

---

## Scaling Strategy

### 1. Horizontal Scaling

**Vercel automatically scales** serverless functions based on traffic.

**Configuration**:
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    },
    "app/api/cron/**/*.ts": {
      "maxDuration": 60,
      "memory": 2048
    }
  }
}
```

### 2. Database Scaling

**Vercel Postgres** handles connection pooling automatically.

**For heavy workloads**:
- Upgrade to larger Postgres plan
- Implement read replicas
- Use caching (Redis) aggressively

### 3. Caching Strategy

```typescript
// lib/cache.ts
import { redis } from '@/lib/redis';

export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Execute function
  const result = await fn();

  // Cache result
  await redis.setex(key, ttl, JSON.stringify(result));

  return result;
}

// Usage
const channels = await cached('channels:user:123', 300, async () => {
  return prisma.channel.findMany({ where: { userId: '123' } });
});
```

---

## Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all API routes
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF tokens for mutations
- [ ] Webhook signature verification
- [ ] Database row-level security
- [ ] Regular dependency updates
- [ ] Security headers configured
- [ ] Secrets rotation policy

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run tests locally: `npm test`
- [ ] Check TypeScript: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Database migrations ready
- [ ] Environment variables configured

### Deployment
- [ ] Merge to `staging` branch
- [ ] Verify staging deployment
- [ ] Run smoke tests on staging
- [ ] Merge to `main` branch
- [ ] Verify production deployment
- [ ] Run smoke tests on production

### Post-Deployment
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics (Vercel Analytics)
- [ ] Verify cron jobs running
- [ ] Test critical user flows
- [ ] Monitor database performance
- [ ] Check API response times

---

## Rollback Procedure

### Instant Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Restore from backup
psql $POSTGRES_URL_NON_POOLING < backup-20241109.sql

# Or revert migration
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Cost Optimization

### Vercel Costs

| Service | Free Tier | Pro Tier | Estimated Cost |
|---------|-----------|----------|----------------|
| Hosting | 100GB bandwidth | Unlimited | $20/month |
| Postgres | 256MB | 512MB-2GB | $20-40/month |
| KV (Redis) | 256MB | 1GB-10GB | $10-30/month |
| Blob Storage | 100GB | Unlimited | $0.15/GB |
| Functions | 100GB-hrs | Unlimited | Included |

**Total estimated cost**: $50-100/month for 1,000 users

### Optimization Tips

1. **Use caching aggressively** - Reduce database queries
2. **Optimize images** - Use Next.js Image component
3. **Enable compression** - Gzip/Brotli (automatic on Vercel)
4. **Minimize function execution time** - Faster = cheaper
5. **Use edge functions** for auth - Lower latency

---

This deployment specification provides a complete guide for deploying and operating the application on Vercel with best practices for monitoring, scaling, and security.
