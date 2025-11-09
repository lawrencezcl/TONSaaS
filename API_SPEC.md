# API Specification: AI-Powered Telegram Channel Management SaaS

## API Design Principles

- **RESTful**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **Versioned**: All endpoints under `/api/v1/`
- **JSON**: Request/response bodies in JSON format
- **Type-Safe**: TypeScript interfaces for all payloads
- **Validated**: Zod schemas for input validation
- **Authenticated**: JWT tokens via TON Connect
- **Rate-Limited**: Per-user and per-IP limits
- **Documented**: OpenAPI/Swagger spec

---

## Authentication

### POST `/api/auth/ton-connect`

**Purpose**: Authenticate user via TON wallet signature

**Request**:
```typescript
interface TonConnectRequest {
  proof: {
    timestamp: number;
    domain: string;
    signature: string;
    payload: string;
  };
  tonAddress: string;
}
```

**Response**:
```typescript
interface TonConnectResponse {
  token: string; // JWT token
  user: {
    id: string;
    tonAddress: string;
    subscriptionTier: "free" | "pro" | "business" | "enterprise";
    subscriptionEndDate: string | null;
  };
}
```

**Error Responses**:
- `400`: Invalid proof signature
- `401`: Unauthorized (expired proof)
- `500`: Server error

**Example**:
```bash
curl -X POST https://api.channelgrowth.com/api/auth/ton-connect \
  -H "Content-Type: application/json" \
  -d '{
    "proof": {
      "timestamp": 1699564800,
      "domain": "channelgrowth.com",
      "signature": "...",
      "payload": "..."
    },
    "tonAddress": "EQD7x...g8Hs"
  }'
```

---

### GET `/api/auth/session`

**Purpose**: Validate current session and get user info

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface SessionResponse {
  user: {
    id: string;
    tonAddress: string;
    email: string | null;
    subscriptionTier: string;
    subscriptionEndDate: string | null;
  };
}
```

**Error Responses**:
- `401`: Invalid or expired token
- `500`: Server error

---

## Channels

### GET `/api/channels`

**Purpose**: List all channels for authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
```typescript
interface ChannelsQuery {
  page?: number; // default: 1
  limit?: number; // default: 10, max: 50
  sort?: "name" | "subscribers" | "created"; // default: created
  order?: "asc" | "desc"; // default: desc
  search?: string; // search by name or username
}
```

**Response**:
```typescript
interface ChannelsResponse {
  channels: Array<{
    id: string;
    telegramChannelId: string;
    channelName: string;
    channelUsername: string | null;
    subscriberCount: number;
    niche: string | null;
    isActive: boolean;
    lastSyncAt: string | null;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

**Example**:
```bash
curl -X GET "https://api.channelgrowth.com/api/channels?page=1&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### POST `/api/channels`

**Purpose**: Add a new channel to user's account

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request**:
```typescript
interface CreateChannelRequest {
  telegramChannelId: string; // e.g., "@cryptonews" or numeric ID
}
```

**Response**:
```typescript
interface CreateChannelResponse {
  channel: {
    id: string;
    telegramChannelId: string;
    channelName: string;
    channelUsername: string | null;
    subscriberCount: number;
    niche: string | null;
    isActive: boolean;
    lastSyncAt: string | null;
    createdAt: string;
  };
}
```

**Error Responses**:
- `400`: Invalid channel ID or channel already added
- `402`: Payment required (subscription tier limit reached)
- `403`: Forbidden (not admin of the channel)
- `500`: Server error

**Example**:
```bash
curl -X POST https://api.channelgrowth.com/api/channels \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"telegramChannelId": "@cryptonews"}'
```

---

### GET `/api/channels/:id`

**Purpose**: Get details for a specific channel

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface ChannelDetailsResponse {
  channel: {
    id: string;
    telegramChannelId: string;
    channelName: string;
    channelUsername: string | null;
    subscriberCount: number;
    niche: string | null;
    isActive: boolean;
    lastSyncAt: string | null;
    createdAt: string;
    updatedAt: string;
    // Additional computed fields
    subscriberGrowth30d: number;
    avgEngagementRate: number;
    estimatedMonthlyRevenue: number;
  };
}
```

**Error Responses**:
- `404`: Channel not found
- `403`: Forbidden (not owned by user)
- `500`: Server error

---

### PATCH `/api/channels/:id`

**Purpose**: Update channel settings

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request**:
```typescript
interface UpdateChannelRequest {
  niche?: string;
  isActive?: boolean;
}
```

**Response**:
```typescript
interface UpdateChannelResponse {
  channel: ChannelDetails;
}
```

**Error Responses**:
- `400`: Invalid input
- `404`: Channel not found
- `403`: Forbidden
- `500`: Server error

---

### DELETE `/api/channels/:id`

**Purpose**: Remove channel from user's account

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface DeleteChannelResponse {
  success: true;
  message: "Channel deleted successfully";
}
```

**Error Responses**:
- `404`: Channel not found
- `403`: Forbidden
- `500`: Server error

---

### POST `/api/channels/:id/sync`

**Purpose**: Manually trigger channel data sync

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface SyncChannelResponse {
  success: true;
  lastSyncAt: string;
  subscriberCount: number;
  newPostsCount: number;
}
```

**Error Responses**:
- `429`: Rate limited (max 1 sync per 5 minutes)
- `404`: Channel not found
- `500`: Server error

---

## Analytics

### GET `/api/channels/:id/analytics`

**Purpose**: Get analytics data for a channel

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
```typescript
interface AnalyticsQuery {
  startDate?: string; // ISO date, default: 30 days ago
  endDate?: string; // ISO date, default: today
  granularity?: "hour" | "day" | "week" | "month"; // default: day
  metrics?: string[]; // array of metric names, default: all
}
```

**Response**:
```typescript
interface AnalyticsResponse {
  channel: {
    id: string;
    name: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  data: Array<{
    date: string;
    subscriberCount: number;
    newSubscribers: number;
    postsCount: number;
    totalViews: number;
    totalReactions: number;
    engagementRate: number;
    estimatedAdRevenue: number;
  }>;
  summary: {
    totalSubscribers: number;
    subscriberGrowth: number;
    subscriberGrowthPercentage: number;
    avgEngagementRate: number;
    totalPosts: number;
    totalViews: number;
    totalRevenue: number;
  };
}
```

**Example**:
```bash
curl -X GET "https://api.channelgrowth.com/api/channels/ch_123/analytics?startDate=2024-10-01&endDate=2024-11-01&granularity=day" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### GET `/api/channels/:id/posts`

**Purpose**: Get post-level analytics for a channel

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
```typescript
interface PostsQuery {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  sort?: "date" | "views" | "engagement"; // default: date
  order?: "asc" | "desc"; // default: desc
  contentType?: "text" | "photo" | "video" | "all"; // default: all
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}
```

**Response**:
```typescript
interface PostsResponse {
  posts: Array<{
    id: string;
    telegramMessageId: string;
    postDate: string;
    contentType: string;
    postLength: number;
    hasMedia: boolean;
    views: number;
    reactions: number;
    shares: number;
    forwards: number;
    engagementRate: number;
    hashtags: string[];
  }>;
  total: number;
  page: number;
  limit: number;
}
```

**Example**:
```bash
curl -X GET "https://api.channelgrowth.com/api/channels/ch_123/posts?sort=engagement&order=desc&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### GET `/api/analytics/dashboard`

**Purpose**: Get aggregated dashboard data across all channels

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface DashboardResponse {
  totalChannels: number;
  totalSubscribers: number;
  subscriberGrowth30d: number;
  totalPosts30d: number;
  avgEngagementRate: number;
  estimatedMonthlyRevenue: number;
  topChannels: Array<{
    id: string;
    name: string;
    subscribers: number;
    growth30d: number;
    engagementRate: number;
  }>;
  recentPosts: Array<{
    id: string;
    channelName: string;
    postDate: string;
    views: number;
    engagementRate: number;
  }>;
}
```

---

## AI Recommendations

### GET `/api/recommendations`

**Purpose**: Get all AI-generated recommendations for user's channels

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
```typescript
interface RecommendationsQuery {
  channelId?: string; // filter by channel
  isActive?: boolean; // default: true
  sort?: "impact" | "confidence" | "created"; // default: impact
  order?: "asc" | "desc"; // default: desc
}
```

**Response**:
```typescript
interface RecommendationsResponse {
  recommendations: Array<{
    id: string;
    channelId: string;
    channelName: string;
    recommendationType: string;
    title: string;
    description: string;
    confidenceScore: number;
    expectedImpactPercentage: number;
    isActive: boolean;
    isDismissed: boolean;
    createdAt: string;
  }>;
}
```

**Example**:
```bash
curl -X GET "https://api.channelgrowth.com/api/recommendations?channelId=ch_123&isActive=true" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### POST `/api/recommendations/generate`

**Purpose**: Manually trigger AI recommendation generation for a channel

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request**:
```typescript
interface GenerateRecommendationsRequest {
  channelId: string;
}
```

**Response**:
```typescript
interface GenerateRecommendationsResponse {
  recommendations: Array<{
    id: string;
    recommendationType: string;
    title: string;
    description: string;
    confidenceScore: number;
    expectedImpactPercentage: number;
  }>;
  generatedAt: string;
}
```

**Error Responses**:
- `429`: Rate limited (max 1 generation per hour per channel)
- `400`: Insufficient data (need at least 30 days of data)
- `404`: Channel not found
- `500`: Server error

---

### POST `/api/recommendations/:id/dismiss`

**Purpose**: Dismiss a recommendation

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface DismissRecommendationResponse {
  success: true;
  recommendation: {
    id: string;
    isDismissed: true;
  };
}
```

---

## Subscriptions

### GET `/api/subscriptions`

**Purpose**: Get user's current subscription details

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface SubscriptionsResponse {
  subscription: {
    id: string;
    plan: "free" | "pro" | "business" | "enterprise";
    monthlyPrice: number;
    status: "active" | "cancelled" | "past_due" | "expired";
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  limits: {
    maxChannels: number;
    currentChannels: number;
    hasAdvancedAnalytics: boolean;
    hasAIRecommendations: boolean;
    hasCompetitorAnalysis: boolean;
    hasPrioritySupport: boolean;
  };
}
```

---

### POST `/api/subscriptions/create`

**Purpose**: Create a new subscription

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request**:
```typescript
interface CreateSubscriptionRequest {
  plan: "pro" | "business" | "enterprise";
  paymentMethod: "ton" | "stripe";
}
```

**Response**:
```typescript
interface CreateSubscriptionResponse {
  subscription: {
    id: string;
    plan: string;
    monthlyPrice: number;
    status: "pending_payment";
  };
  paymentDetails: {
    // For TON payments
    tonAddress?: string;
    amountNanoTon?: string;
    memo?: string;
    // For Stripe payments
    clientSecret?: string;
  };
}
```

---

### POST `/api/subscriptions/cancel`

**Purpose**: Cancel user's subscription

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request**:
```typescript
interface CancelSubscriptionRequest {
  immediate?: boolean; // default: false (cancel at period end)
  reason?: string;
}
```

**Response**:
```typescript
interface CancelSubscriptionResponse {
  subscription: {
    id: string;
    status: "cancelled";
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  };
}
```

---

### POST `/api/subscriptions/webhooks/ton`

**Purpose**: TON payment webhook (called by blockchain indexer)

**Headers**:
```
X-Webhook-Secret: <secret>
```

**Request**:
```typescript
interface TonWebhookRequest {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string; // in nanoTON
  memo: string;
  timestamp: number;
}
```

**Response**:
```typescript
interface TonWebhookResponse {
  success: true;
  subscriptionId: string;
  status: "activated";
}
```

---

### POST `/api/subscriptions/webhooks/stripe`

**Purpose**: Stripe webhook for payment events

**Headers**:
```
Stripe-Signature: <signature>
```

**Request**: Raw Stripe webhook event

**Response**:
```typescript
interface StripeWebhookResponse {
  received: true;
}
```

---

## Cron Jobs (Internal API)

### GET `/api/cron/sync-channels`

**Purpose**: Sync all active channels (runs hourly)

**Headers**:
```
Authorization: Bearer <cron_secret>
```

**Response**:
```typescript
interface SyncChannelsResponse {
  synced: number;
  failed: number;
  duration: number; // milliseconds
}
```

---

### GET `/api/cron/generate-recs`

**Purpose**: Generate AI recommendations for all channels (runs daily)

**Headers**:
```
Authorization: Bearer <cron_secret>
```

**Response**:
```typescript
interface GenerateRecsResponse {
  channelsProcessed: number;
  recommendationsGenerated: number;
  duration: number;
}
```

---

## Error Response Format

All errors follow this format:

```typescript
interface ErrorResponse {
  error: {
    code: string; // machine-readable error code
    message: string; // human-readable message
    details?: any; // optional additional context
  };
}
```

**Common Error Codes**:
- `INVALID_INPUT`: Validation error
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `PAYMENT_REQUIRED`: Subscription tier limit
- `SERVER_ERROR`: Internal server error

**Example**:
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "You can only sync a channel once every 5 minutes",
    "details": {
      "retryAfter": 180
    }
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All API endpoints | 100 requests | 1 minute |
| `/api/channels` POST | 10 requests | 1 hour |
| `/api/channels/:id/sync` | 1 request | 5 minutes |
| `/api/recommendations/generate` | 1 request | 1 hour |
| Authentication endpoints | 20 requests | 5 minutes |

**Rate limit headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699564920
```

---

## Validation Schemas (Zod)

### Example: Create Channel

```typescript
import { z } from "zod";

export const createChannelSchema = z.object({
  telegramChannelId: z
    .string()
    .min(1)
    .refine(
      (val) => val.startsWith("@") || /^\d+$/.test(val),
      "Must be a username (starting with @) or numeric ID"
    ),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
```

### Example: Analytics Query

```typescript
export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
  metrics: z.array(z.string()).optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
```

---

## OpenAPI/Swagger Documentation

The API is fully documented using OpenAPI 3.0 specification, available at:

- **Development**: `http://localhost:3000/api/docs`
- **Production**: `https://api.channelgrowth.com/api/docs`

Interactive API explorer powered by Swagger UI.

---

This API specification provides a complete reference for all backend endpoints with type-safe TypeScript definitions and Zod validation schemas.
