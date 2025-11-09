# UI/UX Specification: AI-Powered Telegram Channel Management SaaS

## Design System (shadcn/ui)

### Component Library
- **Base**: shadcn/ui components (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Typography**: Inter (UI), JetBrains Mono (code/data)
- **Color Palette**: Custom dark/light theme

### Theme Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for Telegram branding
        telegram: {
          blue: "#0088cc",
          light: "#64b5ef",
          dark: "#0077b5",
        },
        // Data visualization colors
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### CSS Variables

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}
```

---

## Page Layouts

### 1. Landing Page (`/`)

**Purpose**: Convert visitors to sign-ups

**Sections**:
```
┌─────────────────────────────────────────────┐
│ Navigation Bar                               │
│ [Logo] [Features] [Pricing] [Login] [CTA]   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Hero Section                                 │
│ • Headline: "Grow Your Telegram Channel      │
│   Revenue by 30% with AI"                    │
│ • Subheadline: "Analytics + Recommendations" │
│ • CTA: [Connect TON Wallet] [See Demo]       │
│ • Hero Image: Dashboard preview              │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Social Proof                                 │
│ • "5,000+ channels use ChannelGrowth"        │
│ • Logos: top channels/brands                 │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Problem/Solution                             │
│ • 3-column grid showing pain points          │
│ • How we solve each problem                  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Features Showcase                            │
│ • Analytics Dashboard (screenshot)           │
│ • AI Recommendations (screenshot)            │
│ • Monetization Optimizer (screenshot)        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Pricing Section                              │
│ • 3 tiers: Pro / Business / Enterprise       │
│ • Feature comparison table                   │
│ • CTA: [Start Free Trial]                    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Testimonials                                 │
│ • 6 customer quotes with avatars             │
│ • Revenue increase metrics                   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Final CTA                                    │
│ • "Join 5,000+ channel owners"               │
│ • [Get Started Now]                          │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Footer                                       │
│ • Links: About, Privacy, Terms, Support      │
│ • Social: Twitter, Telegram, Discord         │
└─────────────────────────────────────────────┘
```

**Components**:
- `<Navigation />` - Sticky header with shadcn/ui NavigationMenu
- `<Hero />` - Large heading with gradient text
- `<FeatureCard />` - Card component with icon, title, description
- `<PricingCard />` - shadcn/ui Card with pricing details
- `<TestimonialCard />` - Quote with avatar and stats
- `<Button />` - shadcn/ui Button with variants

---

### 2. Dashboard (`/dashboard`)

**Layout**: Sidebar + Main Content

```
┌──────────┬────────────────────────────────────────┐
│          │ Top Navigation Bar                     │
│ Sidebar  │ [Search] [Notifications] [User Menu]   │
│          ├────────────────────────────────────────┤
│ • Home   │                                        │
│ • Channels│ Dashboard Overview                     │
│ • Analytics│                                       │
│ • Recommendations│                                │
│ • Settings│ ┌──────────┬──────────┬──────────┐   │
│          │ │ Stat Card│ Stat Card│ Stat Card│   │
│ [Upgrade]│ │ Total    │ New      │ Avg      │   │
│          │ │ Subs     │ Subs     │ Engagement│   │
│          │ │ 12.5K    │ +245     │ 4.2%     │   │
│          │ └──────────┴──────────┴──────────┘   │
│          │                                        │
│          │ ┌──────────────────────────────────┐ │
│          │ │ Subscriber Growth Chart          │ │
│          │ │ (Line chart - last 30 days)      │ │
│          │ │                                  │ │
│          │ └──────────────────────────────────┘ │
│          │                                        │
│          │ ┌──────────┬───────────────────────┐ │
│          │ │ Top Posts│ AI Recommendations     │ │
│          │ │ • Post 1 │ • Post at 2pm daily   │ │
│          │ │ • Post 2 │ • Increase video 40%  │ │
│          │ │ • Post 3 │ • Use hashtag #tech   │ │
│          │ └──────────┴───────────────────────┘ │
└──────────┴────────────────────────────────────────┘
```

**Components**:
- `<DashboardLayout />` - Sidebar + main content wrapper
- `<Sidebar />` - Navigation with icons (Lucide)
- `<StatCard />` - shadcn/ui Card with metric display
- `<SubscriberChart />` - Recharts LineChart
- `<TopPostsList />` - shadcn/ui Table component
- `<RecommendationCard />` - Card with AI suggestion

---

### 3. Channels List (`/dashboard/channels`)

```
┌────────────────────────────────────────────────┐
│ My Channels                                     │
│ ┌──────────────────┐ ┌──────────────┐         │
│ │ [Add New Channel]│ │ [Filter: All]│         │
│ └──────────────────┘ └──────────────┘         │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Channel Card 1                          │   │
│ │ ┌────┐ Crypto News Daily                │   │
│ │ │[🎯]│ @cryptonewsdaily                  │   │
│ │ └────┘ 12,500 subscribers | ↑ 245 (30d) │   │
│ │        Engagement: 4.2% | Revenue: $450 │   │
│ │        [View Analytics] [Settings]      │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Channel Card 2                          │   │
│ │ ┌────┐ Tech Insights                    │   │
│ │ │[💻]│ @techinsights                     │   │
│ │ └────┘ 8,300 subscribers | ↑ 120 (30d)  │   │
│ │        Engagement: 5.1% | Revenue: $280 │   │
│ │        [View Analytics] [Settings]      │   │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Components**:
- `<ChannelCard />` - Displays channel metadata
- `<AddChannelDialog />` - shadcn/ui Dialog for adding channel
- `<FilterDropdown />` - shadcn/ui DropdownMenu
- `<Badge />` - shadcn/ui Badge for status indicators

---

### 4. Channel Analytics (`/dashboard/channels/[id]`)

```
┌────────────────────────────────────────────────┐
│ Crypto News Daily (@cryptonewsdaily)           │
│ [⚙️ Settings] [🔄 Sync Now]                     │
├────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬──────────┐ │
│ │ Subs     │ Growth   │ Posts    │ Revenue  │ │
│ │ 12,500   │ +245(30d)│ 42 (30d) │ $450/mo  │ │
│ └──────────┴──────────┴──────────┴──────────┘ │
│                                                 │
│ ┌──────────────────────────────────────────┐  │
│ │ Subscriber Growth                        │  │
│ │ [7D] [30D] [90D] [All Time]              │  │
│ │ (Line chart with trend line)             │  │
│ │                                          │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ ┌──────────────────────┬───────────────────┐  │
│ │ Engagement by Hour   │ Content Type Mix  │  │
│ │ (Bar chart)          │ (Pie chart)       │  │
│ │                      │                   │  │
│ └──────────────────────┴───────────────────┘  │
│                                                 │
│ ┌──────────────────────────────────────────┐  │
│ │ Top Performing Posts                     │  │
│ │ (Data table with sort/filter)            │  │
│ │ Date | Post | Views | Engagement | Type  │  │
│ │ ─────────────────────────────────────────│  │
│ │ Nov 8│"AI..."│ 2.5K │ 8.2%       │ Text  │  │
│ │ Nov 7│"Crpt."│ 2.1K │ 6.5%       │ Video │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Components**:
- `<ChannelHeader />` - Channel info with actions
- `<MetricCard />` - Key performance indicators
- `<TimeRangeSelector />` - shadcn/ui Tabs for date ranges
- `<EngagementChart />` - Recharts BarChart
- `<ContentMixChart />` - Recharts PieChart
- `<PostsTable />` - shadcn/ui DataTable with sorting

---

### 5. AI Recommendations (`/dashboard/recommendations`)

```
┌────────────────────────────────────────────────┐
│ AI Recommendations                              │
│ [Filter: Active] [Sort: Impact ▼]              │
├────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🚀 High Impact Recommendation           │   │
│ │ ────────────────────────────────────────│   │
│ │ Optimize Posting Time                   │   │
│ │                                         │   │
│ │ Your posts at 2pm get 3.2x more views   │   │
│ │ than average. Schedule more content     │   │
│ │ during this window.                     │   │
│ │                                         │   │
│ │ Expected Impact: +30% engagement        │   │
│ │ Confidence: 92%                         │   │
│ │ Channel: Crypto News Daily              │   │
│ │                                         │   │
│ │ [Apply Now] [Dismiss] [Learn More]     │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📊 Medium Impact Recommendation         │   │
│ │ ────────────────────────────────────────│   │
│ │ Increase Video Content                  │   │
│ │                                         │   │
│ │ Video posts get 2.1x more engagement    │   │
│ │ than text. Aim for 40% video content.   │   │
│ │                                         │   │
│ │ Expected Impact: +25% engagement        │   │
│ │ Confidence: 88%                         │   │
│ │ Channel: Tech Insights                  │   │
│ │                                         │   │
│ │ [Apply Now] [Dismiss] [Learn More]     │   │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Components**:
- `<RecommendationCard />` - Card with impact badge
- `<ImpactBadge />` - Color-coded badge (high/medium/low)
- `<ConfidenceScore />` - Progress bar showing confidence
- `<ApplyRecommendationDialog />` - Confirmation modal

---

### 6. Settings (`/dashboard/settings`)

**Tabs**: Profile | Channels | Billing | Integrations

```
┌────────────────────────────────────────────────┐
│ Settings                                        │
│ [Profile] [Channels] [Billing] [Integrations]  │
├────────────────────────────────────────────────┤
│                                                 │
│ Profile Settings                                │
│ ────────────────                                │
│                                                 │
│ TON Wallet Address                              │
│ ┌──────────────────────────────────────────┐  │
│ │ EQD7x...g8Hs [Connected ✓]              │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ Email (optional)                                │
│ ┌──────────────────────────────────────────┐  │
│ │ user@example.com                         │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ Notification Preferences                        │
│ ☑ Weekly insights email                        │
│ ☑ New recommendations                           │
│ ☐ Marketing updates                             │
│                                                 │
│ [Save Changes]                                  │
└────────────────────────────────────────────────┘
```

**Components**:
- `<SettingsTabs />` - shadcn/ui Tabs component
- `<WalletConnection />` - TON Connect button
- `<SettingsForm />` - Form with shadcn/ui Input, Checkbox
- `<SaveButton />` - shadcn/ui Button with loading state

---

### 7. Billing & Subscription (`/dashboard/billing`)

```
┌────────────────────────────────────────────────┐
│ Billing & Subscription                          │
├────────────────────────────────────────────────┤
│                                                 │
│ Current Plan: Business                          │
│ ────────────────────────                        │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Business Plan - $99/month               │   │
│ │ ────────────────────────────────────────│   │
│ │ ✓ Up to 20 channels                     │   │
│ │ ✓ Advanced analytics                    │   │
│ │ ✓ AI recommendations                    │   │
│ │ ✓ Competitor analysis                   │   │
│ │ ✓ Priority support                      │   │
│ │                                         │   │
│ │ Next billing: Dec 9, 2025               │   │
│ │ Amount: 99 TON                          │   │
│ │                                         │   │
│ │ [Upgrade to Enterprise] [Cancel Plan]  │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Billing History                                 │
│ ────────────────                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Date      | Amount | Status | Invoice   │  │
│ │ ──────────────────────────────────────── │  │
│ │ Nov 9     | 99 TON | Paid   | Download  │  │
│ │ Oct 9     | 99 TON | Paid   | Download  │  │
│ │ Sep 9     | 29 TON | Paid   | Download  │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Components**:
- `<CurrentPlanCard />` - shadcn/ui Card with plan details
- `<UpgradeDialog />` - Modal for plan upgrade
- `<CancelDialog />` - Confirmation modal for cancellation
- `<BillingHistoryTable />` - shadcn/ui DataTable

---

## Component Library

### Required shadcn/ui Components

```bash
# Install all required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add avatar
```

### Custom Components

```typescript
// components/ui/stat-card.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? "↑" : "↓"} {Math.abs(change)} {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

```typescript
// components/ui/metric-card.tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function MetricCard({ label, value, trend, trendValue }: MetricCardProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend && trendValue && (
          <Badge variant={trend === "up" ? "default" : "destructive"}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </Badge>
        )}
      </div>
    </div>
  );
}
```

---

## Responsive Design

### Breakpoints (Tailwind defaults)
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (extra large)

### Mobile-First Strategy

```typescript
// Example: Responsive dashboard layout
<div className="flex flex-col lg:flex-row">
  {/* Sidebar - hidden on mobile, visible on desktop */}
  <aside className="hidden lg:block lg:w-64 border-r">
    <Sidebar />
  </aside>
  
  {/* Mobile navigation - visible only on mobile */}
  <MobileNav className="lg:hidden" />
  
  {/* Main content - full width on mobile, adjusts on desktop */}
  <main className="flex-1 p-4 lg:p-8">
    <DashboardContent />
  </main>
</div>
```

---

## Loading States

### Skeleton Loaders

```typescript
// components/skeletons/stat-card-skeleton.tsx
export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[100px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-3 w-[80px] mt-2" />
      </CardContent>
    </Card>
  );
}

// components/skeletons/chart-skeleton.tsx
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
```

---

## Accessibility

### ARIA Labels
- All interactive elements have `aria-label`
- Form inputs linked to labels via `htmlFor`
- Icons have descriptive text (Lucide provides this)

### Keyboard Navigation
- Tab order follows visual flow
- All actions accessible via keyboard
- Escape key closes modals/dialogs
- Enter key submits forms

### Color Contrast
- WCAG AA compliance (4.5:1 for text)
- Dark mode optimized for readability
- Status colors distinguishable without color

---

## Animation & Micro-interactions

### Transitions
```typescript
// Use Tailwind transition utilities
className="transition-all duration-200 hover:scale-105"

// Use shadcn/ui built-in animations
// (accordion, dialog, dropdown all have smooth animations)
```

### Feedback
- Button click: scale down slightly
- Loading states: shimmer effect on skeletons
- Success: green checkmark animation
- Error: red shake animation

---

## Performance Optimizations

### Image Optimization
```typescript
import Image from "next/image";

<Image
  src="/channel-avatar.jpg"
  alt="Channel avatar"
  width={48}
  height={48}
  className="rounded-full"
  priority={false} // lazy load
/>
```

### Code Splitting
```typescript
// Lazy load heavy components
const RechartsLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

### Font Optimization
```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
```

---

This UI/UX specification provides a complete design system using shadcn/ui with Tailwind CSS, optimized for modern web development with Next.js.
