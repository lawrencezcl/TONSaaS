// Mock in-memory database for demo/production without DB setup
// This allows the app to work without Postgres initially

interface User {
  id: string;
  tonAddress: string;
  email?: string;
  subscriptionTier: string;
  subscriptionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Channel {
  id: string;
  userId: string;
  telegramChannelId: string;
  channelName: string;
  channelUsername?: string;
  subscriberCount: number;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ChannelAnalytics {
  id: string;
  channelId: string;
  date: Date;
  subscriberCount: number;
  newSubscribers: number;
  postsCount: number;
  totalViews: number;
  totalReactions: number;
  engagementRate: number;
  estimatedAdRevenue: number;
  createdAt: Date;
}

interface AIRecommendation {
  id: string;
  channelId: string;
  recommendationType: string;
  title: string;
  description: string;
  confidenceScore: number;
  expectedImpactPercentage: number;
  isActive: boolean;
  isDismissed: boolean;
  createdAt: Date;
}

// In-memory storage
const mockData = {
  users: new Map<string, User>(),
  channels: new Map<string, Channel>(),
  analytics: new Map<string, ChannelAnalytics>(),
  posts: new Map<string, any>(),
  recommendations: new Map<string, AIRecommendation>(),
};

// Helper to generate IDs
function generateId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Mock Prisma client interface
export const mockPrisma = {
  user: {
    findUnique: async ({ where, include }: any) => {
      let user: User | undefined;
      if (where.tonAddress) {
        user = Array.from(mockData.users.values()).find(
          (u) => u.tonAddress === where.tonAddress
        );
      } else {
        user = mockData.users.get(where.id);
      }
      
      if (!user) return null;
      
      // Handle include relations
      if (include?.channels) {
        const channels = Array.from(mockData.channels.values()).filter(
          (c) => c.userId === user!.id
        );
        return { ...user, channels };
      }
      
      return user;
    },
    create: async ({ data }: any) => {
      const user: User = {
        id: generateId(),
        tonAddress: data.tonAddress,
        email: data.email,
        subscriptionTier: data.subscriptionTier || 'free',
        subscriptionEndDate: data.subscriptionEndDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockData.users.set(user.id, user);
      return user;
    },
  },
  channel: {
    findMany: async ({ where }: any) => {
      return Array.from(mockData.channels.values()).filter(
        (c) => c.userId === where.userId
      );
    },
    findUnique: async ({ where }: any) => {
      if (where.telegramChannelId) {
        return Array.from(mockData.channels.values()).find(
          (c) => c.telegramChannelId === where.telegramChannelId
        ) || null;
      }
      return mockData.channels.get(where.id) || null;
    },
    create: async ({ data }: any) => {
      const channel: Channel = {
        id: generateId(),
        userId: data.userId,
        telegramChannelId: data.telegramChannelId,
        channelName: data.channelName,
        channelUsername: data.channelUsername,
        subscriberCount: data.subscriberCount || 0,
        isActive: data.isActive ?? true,
        lastSyncAt: data.lastSyncAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockData.channels.set(channel.id, channel);
      return channel;
    },
    update: async ({ where, data }: any) => {
      const channel = mockData.channels.get(where.id);
      if (!channel) throw new Error('Channel not found');
      Object.assign(channel, data, { updatedAt: new Date() });
      return channel;
    },
  },
  channelAnalytics: {
    findMany: async ({ where }: any) => {
      return Array.from(mockData.analytics.values()).filter(
        (a) => a.channelId === where.channelId
      );
    },
    aggregate: async ({ where, _sum, _avg }: any) => {
      const items = Array.from(mockData.analytics.values()).filter(
        (a) => a.channelId === where.channelId
      );
      
      const sum: any = {};
      const avg: any = {};
      
      if (_sum) {
        Object.keys(_sum).forEach((key) => {
          sum[key] = items.reduce((acc, item: any) => acc + (item[key] || 0), 0);
        });
      }
      
      if (_avg) {
        Object.keys(_avg).forEach((key) => {
          const total = items.reduce((acc, item: any) => acc + (item[key] || 0), 0);
          avg[key] = items.length > 0 ? total / items.length : 0;
        });
      }
      
      return { _sum: sum, _avg: avg };
    },
    upsert: async ({ where, update, create }: any) => {
      // Find existing record
      const existing = Array.from(mockData.analytics.values()).find(
        (a) => a.channelId === where.channelId_date.channelId && 
               a.date.toDateString() === where.channelId_date.date.toDateString()
      );
      
      if (existing) {
        Object.assign(existing, update);
        return existing;
      } else {
        const analytics: ChannelAnalytics = {
          id: generateId(),
          ...create,
        };
        mockData.analytics.set(analytics.id, analytics);
        return analytics;
      }
    },
  },
  postAnalytics: {
    upsert: async ({ where, update, create }: any) => {
      // Find existing record
      const existing = Array.from(mockData.posts || []).find(
        (p: any) => 
          p.channelId === where.channelId_telegramMessageId.channelId && 
          p.telegramMessageId === where.channelId_telegramMessageId.telegramMessageId
      );
      
      if (existing) {
        Object.assign(existing, update);
        return existing;
      } else {
        const post = {
          id: generateId(),
          ...create,
          createdAt: new Date(),
        };
        if (!mockData.posts) mockData.posts = new Map();
        mockData.posts.set(post.id, post);
        return post;
      }
    },
  },
  aIRecommendation: {
    findMany: async ({ where }: any) => {
      return Array.from(mockData.recommendations.values()).filter(
        (r) => r.channelId === where.channelId && r.isActive
      );
    },
    create: async ({ data }: any) => {
      const rec: AIRecommendation = {
        id: generateId(),
        channelId: data.channelId,
        recommendationType: data.recommendationType,
        title: data.title,
        description: data.description,
        confidenceScore: data.confidenceScore,
        expectedImpactPercentage: data.expectedImpactPercentage,
        isActive: data.isActive ?? true,
        isDismissed: data.isDismissed ?? false,
        createdAt: new Date(),
      };
      mockData.recommendations.set(rec.id, rec);
      return rec;
    },
  },
};

// Check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Try to import real Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    return false;
  }
}
