# CI/CD Pipeline Setup Guide
## Local → GitHub → Vercel

This guide provides detailed instructions for setting up a complete CI/CD pipeline for the ChannelGrowth SaaS application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Vercel Project Setup](#vercel-project-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [CI/CD Workflow](#cicd-workflow)
7. [Deployment Process](#deployment-process)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Git** (2.x or later)
- **Node.js** (18.x or later)
- **npm** (9.x or later)
- **Vercel CLI** (optional, for manual deployments)

### Required Accounts

- **GitHub Account** - For code repository
- **Vercel Account** - For hosting and deployment
- **Vercel Postgres** - For production database (recommended)

### Access Tokens

You'll need to generate:
- **GitHub Personal Access Token** with `repo` scope
- **Vercel API Token** with full access

---

## GitHub Repository Setup

### Step 1: Create GitHub Repository

#### Using GitHub Web Interface

1. Navigate to https://github.com/new
2. Enter repository details:
   - **Name**: `TONSaaS` (or your preferred name)
   - **Description**: "AI-Powered Telegram Channel Management SaaS"
   - **Visibility**: Public or Private
3. Click **"Create repository"**

#### Using GitHub API

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{
    "name": "TONSaaS",
    "description": "AI-Powered Telegram Channel Management SaaS",
    "private": false,
    "auto_init": false
  }'
```

### Step 2: Initialize Local Git Repository

```bash
# Navigate to project directory
cd /path/to/TONSaaS

# Initialize Git (if not already done)
git init

# Configure Git user
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI-Powered Telegram Channel Management SaaS"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/TONSaaS.git

# Push to GitHub
git push -u origin main
```

### Step 3: Configure GitHub Authentication

#### Using HTTPS with Token

```bash
# Set remote URL with token embedded
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/TONSaaS.git

# Push changes
git push origin main
```

#### Using SSH (Alternative)

```bash
# Generate SSH key (if not exists)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub (copy output and paste in GitHub Settings → SSH Keys)
cat ~/.ssh/id_ed25519.pub

# Set remote URL to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/TONSaaS.git
```

---

## Vercel Project Setup

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Create Vercel Project

#### Using Vercel Web Dashboard

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Using Vercel API

```bash
# Link project to GitHub repository
curl -X POST "https://api.vercel.com/v9/projects/PROJECT_ID/link" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "github",
    "repo": "YOUR_USERNAME/TONSaaS",
    "gitBranch": "main"
  }'
```

### Step 3: Configure Vercel Project Settings

Create `vercel.json` in your project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "crons": [
    {
      "path": "/api/cron/sync-channels",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-recommendations",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Database Configuration

### Step 1: Create Vercel Postgres Database

#### Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose a region (preferably close to your primary users)
6. Click **"Create"**

#### Using Vercel CLI

```bash
vercel postgres create
```

### Step 2: Update Prisma Schema

Your `prisma/schema.prisma` should be configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

generator client {
  provider = "prisma-client-js"
}

// ... models
```

### Step 3: Deploy Database Schema

After setting up environment variables (see next section):

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate deploy
```

---

## Environment Variables

### Required Environment Variables

#### Production (Vercel)

```env
# Database (Auto-populated by Vercel Postgres)
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Authentication
JWT_SECRET="your-secret-key-min-32-characters-long"

# Telegram (Optional - for real Telegram integration)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Cron Jobs
CRON_SECRET="your-cron-secret-key"

# Optional: Monitoring
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

#### Development (Local)

Create `.env.local` file:

```env
# Database (Use SQLite for local development)
POSTGRES_PRISMA_URL="file:./dev.db"

# Authentication
JWT_SECRET="local-dev-secret-key-min-32-chars-abcdefghijk"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 1: Set Environment Variables in Vercel

#### Using Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - **Key**: Variable name
   - **Value**: Variable value
   - **Environment**: Production, Preview, Development (select as needed)
3. Click **"Save"**

#### Using Vercel API

```bash
# Set JWT_SECRET
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "JWT_SECRET",
    "value": "your-secret-key-min-32-characters-long",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'

# Set CRON_SECRET
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "CRON_SECRET",
    "value": "your-cron-secret-key",
    "type": "encrypted",
    "target": ["production"]
  }'
```

#### Using Vercel CLI

```bash
vercel env add JWT_SECRET production
# Enter value when prompted

vercel env add CRON_SECRET production
# Enter value when prompted
```

### Step 2: Link Environment Variables to GitHub

Vercel automatically syncs environment variables when linked to GitHub. No additional configuration needed.

---

## CI/CD Workflow

### Workflow Overview

```
┌─────────────┐
│   Local     │
│ Development │
└─────┬───────┘
      │
      │ git commit
      │ git push
      ▼
┌─────────────┐
│   GitHub    │
│ Repository  │
└─────┬───────┘
      │
      │ Webhook trigger
      ▼
┌─────────────┐
│   Vercel    │
│   Build     │
└─────┬───────┘
      │
      │ Deployment
      ▼
┌─────────────┐
│ Production  │
│   (Live)    │
└─────────────┘
```

### Automatic Deployment Triggers

Vercel automatically deploys when:

1. **Push to `main` branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull request created/updated** → Preview deployment with comment

### Deployment Configuration

Vercel uses these settings from `vercel.json`:

- **Build Command**: `prisma generate && next build`
- **Framework**: Next.js (auto-detected)
- **Output Directory**: `.next` (default)
- **Node Version**: 20.x (specified in `package.json` engines or auto-detected)

---

## Deployment Process

### Standard Deployment Flow

```bash
# 1. Make code changes locally
# Edit files in your project

# 2. Test locally
npm run dev

# 3. Build locally to verify
npm run build

# 4. Commit changes
git add .
git commit -m "Description of changes"

# 5. Push to GitHub (triggers automatic deployment)
git push origin main

# 6. Monitor deployment
# Visit https://vercel.com/YOUR_USERNAME/YOUR_PROJECT
# Or watch for deployment URL in terminal/email
```

### Manual Deployment (Fallback)

If GitHub integration fails or you need immediate deployment:

```bash
# Deploy to production
vercel --prod --token YOUR_VERCEL_TOKEN

# Deploy to preview
vercel --token YOUR_VERCEL_TOKEN
```

### Deployment Status Monitoring

#### Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. View deployment list with status indicators:
   - 🟢 **Ready** - Deployment successful
   - 🟡 **Building** - Build in progress
   - 🔴 **Error** - Build failed
   - ⚪ **Queued** - Waiting to build

#### Using Vercel API

```bash
# Get latest deployments
curl "https://api.vercel.com/v6/deployments?projectId=PROJECT_ID&limit=5" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN"

# Get specific deployment status
curl "https://api.vercel.com/v13/deployments/DEPLOYMENT_ID" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN"
```

---

## Deployment Verification

### Post-Deployment Checks

1. **Homepage Loads**
   ```bash
   curl -I https://your-app.vercel.app/
   # Should return: HTTP/2 200
   ```

2. **API Endpoints Respond**
   ```bash
   curl https://your-app.vercel.app/api/health
   # Should return: {"status":"ok"}
   ```

3. **Database Connection**
   - Navigate to `/dashboard` and verify data loads
   - Check Vercel logs for database connection errors

4. **Cron Jobs Configured**
   - Verify in Vercel Dashboard → Cron Jobs
   - Check execution logs

### Rollback Procedure

If deployment fails or has issues:

#### Using Vercel Dashboard

1. Go to Deployments tab
2. Find the last working deployment
3. Click **"⋯"** → **"Promote to Production"**

#### Using Vercel API

```bash
curl -X PATCH \
  "https://api.vercel.com/v13/deployments/PREVIOUS_DEPLOYMENT_ID/promote" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN"
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Build Fails with "Module not found"

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install --save-dev missing-package

# Commit and push
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push origin main
```

#### Issue 2: Database Connection Errors

**Solution:**
1. Verify environment variables are set in Vercel
2. Check `POSTGRES_PRISMA_URL` format
3. Ensure Prisma schema matches database
4. Run `npx prisma generate` in build command

#### Issue 3: GitHub Push Rejected

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Resolve conflicts if any
git add .
git rebase --continue

# Push again
git push origin main
```

#### Issue 4: Vercel Deployment Timeout

**Solution:**
1. Optimize build process
2. Reduce dependencies
3. Use Vercel Pro plan for longer build times
4. Check for infinite loops in build scripts

#### Issue 5: Environment Variables Not Updating

**Solution:**
```bash
# Trigger rebuild after updating env vars
vercel env pull .env.production
vercel --prod --force
```

### Debug Commands

```bash
# View Vercel logs
vercel logs YOUR_PROJECT_NAME --prod

# View build logs
vercel inspect DEPLOYMENT_URL

# Test local build
npm run build && npm start

# Check environment variables
vercel env ls
```

---

## Best Practices

### 1. Branch Strategy

```
main (production)
  ├── develop (staging)
  │   ├── feature/user-auth
  │   ├── feature/analytics
  │   └── bugfix/login-error
  └── hotfix/critical-bug
```

- **main**: Production-ready code only
- **develop**: Integration branch for features
- **feature/***: Individual features
- **hotfix/***: Critical production fixes

### 2. Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Example:
```
feat(auth): add TON Connect wallet integration

- Implement TON Connect SDK
- Add wallet connection UI
- Store wallet address in database

Closes #123
```

### 3. Pre-Deployment Checklist

- [ ] Code builds locally without errors
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] No hardcoded secrets in code
- [ ] Dependencies updated and locked
- [ ] Performance tested
- [ ] Error handling implemented

### 4. Security Best Practices

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Rotate API keys regularly
- Enable Vercel's deployment protection
- Use HTTPS only
- Implement rate limiting on APIs

### 5. Performance Optimization

- Enable Vercel Edge Functions where possible
- Use ISR (Incremental Static Regeneration) for semi-static pages
- Optimize images with Next.js Image component
- Implement proper caching headers
- Monitor bundle size

---

## Advanced Configuration

### Custom Deployment Hooks

Create GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Multi-Environment Setup

```bash
# Production
vercel --prod

# Staging
vercel --target staging

# Preview
vercel
```

Configure in `vercel.json`:

```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false
  },
  "scope": "your-team-name",
  "regions": ["iad1", "sfo1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Monitoring & Logging

### Vercel Analytics

Enable in Vercel Dashboard:
1. Project Settings → Analytics
2. Enable Web Analytics
3. Enable Speed Insights

### Error Tracking (Sentry Integration)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Add to vercel.json
{
  "env": {
    "SENTRY_DSN": "@sentry-dsn"
  }
}
```

### Custom Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, meta?: any) => {
    console.log('[INFO]', msg, meta);
  },
  error: (msg: string, error?: Error) => {
    console.error('[ERROR]', msg, error);
  }
};
```

---

## Support & Resources

### Official Documentation

- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **GitHub**: https://docs.github.com

### Community Resources

- **Vercel Discord**: https://vercel.com/discord
- **Next.js GitHub**: https://github.com/vercel/next.js
- **Stack Overflow**: Tag `vercel`, `next.js`

### Getting Help

1. Check deployment logs in Vercel Dashboard
2. Search Vercel documentation
3. Ask in community forums
4. Contact Vercel support (Pro/Enterprise plans)

---

## Conclusion

Your CI/CD pipeline is now configured for:
- ✅ Automatic deployments from GitHub
- ✅ Production and preview environments
- ✅ Database integration
- ✅ Environment variable management
- ✅ Cron job scheduling
- ✅ Monitoring and logging

For any issues or questions, refer to the troubleshooting section or official documentation.

---

**Last Updated**: 2025-11-09  
**Version**: 1.0.0  
**Author**: ChannelGrowth Development Team
