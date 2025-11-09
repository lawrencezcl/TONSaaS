import { prisma } from '@/lib/db';
import { startOfDay, subDays } from 'date-fns';

export class AnalyticsService {
  /**
   * Get channel analytics for date range
   */
  async getChannelAnalytics(
    channelId: string,
    startDate: Date,
    endDate: Date
  ) {
    const analytics = await prisma.channelAnalytics.findMany({
      where: {
        channelId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return {
      data: analytics,
      summary: this.calculateSummary(analytics),
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(analytics: any[]) {
    if (analytics.length === 0) {
      return {
        totalSubscribers: 0,
        subscriberGrowth: 0,
        subscriberGrowthPercentage: 0,
        avgEngagementRate: 0,
        totalPosts: 0,
        totalViews: 0,
        totalRevenue: 0,
      };
    }

    const first = analytics[0];
    const last = analytics[analytics.length - 1];

    const subscriberGrowth = last.subscriberCount - first.subscriberCount;
    const subscriberGrowthPercentage =
      first.subscriberCount > 0
        ? (subscriberGrowth / first.subscriberCount) * 100
        : 0;

    const avgEngagementRate =
      analytics.reduce((sum, a) => sum + a.engagementRate, 0) /
      analytics.length;

    const totalPosts = analytics.reduce((sum, a) => sum + a.postsCount, 0);
    const totalViews = analytics.reduce((sum, a) => sum + a.totalViews, 0);
    const totalRevenue = analytics.reduce(
      (sum, a) => sum + a.estimatedAdRevenue,
      0
    );

    return {
      totalSubscribers: last.subscriberCount,
      subscriberGrowth,
      subscriberGrowthPercentage: parseFloat(
        subscriberGrowthPercentage.toFixed(2)
      ),
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      totalPosts,
      totalViews,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    };
  }

  /**
   * Get dashboard overview for all user channels
   */
  async getDashboard(userId: string) {
    const channels = await prisma.channel.findMany({
      where: { userId },
    });

    if (channels.length === 0) {
      return {
        totalChannels: 0,
        totalSubscribers: 0,
        subscriberGrowth30d: 0,
        totalPosts30d: 0,
        avgEngagementRate: 0,
        estimatedMonthlyRevenue: 0,
        topChannels: [],
        recentPosts: [],
      };
    }

    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);

    const analytics = await prisma.channelAnalytics.findMany({
      where: {
        channelId: { in: channels.map((c: any) => c.id) },
        date: { gte: thirtyDaysAgo },
      },
    });

    const posts = await prisma.postAnalytics.findMany({
      where: {
        channelId: { in: channels.map((c: any) => c.id) },
        postDate: { gte: thirtyDaysAgo },
      },
      orderBy: { views: 'desc' },
      take: 10,
    });

    const totalSubscribers = channels.reduce(
      (sum: number, c: any) => sum + c.subscriberCount,
      0
    );

    const subscriberGrowth30d = analytics.reduce(
      (sum: number, a: any) => sum + a.newSubscribers,
      0
    );

    const totalPosts30d = analytics.reduce(
      (sum: number, a: any) => sum + a.postsCount,
      0
    );

    const avgEngagementRate =
      analytics.length > 0
        ? analytics.reduce((sum: number, a: any) => sum + a.engagementRate, 0) /
          analytics.length
        : 0;

    const estimatedMonthlyRevenue = analytics.reduce(
      (sum: number, a: any) => sum + a.estimatedAdRevenue,
      0
    );

    return {
      totalChannels: channels.length,
      totalSubscribers,
      subscriberGrowth30d,
      totalPosts30d,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      estimatedMonthlyRevenue: parseFloat(estimatedMonthlyRevenue.toFixed(2)),
      topChannels: channels
        .map((c: any) => ({
          id: c.id,
          name: c.channelName,
          subscribers: c.subscriberCount,
          growth30d: analytics
            .filter((a: any) => a.channelId === c.id)
            .reduce((sum: number, a: any) => sum + a.newSubscribers, 0),
        }))
        .sort((a: any, b: any) => b.subscribers - a.subscribers)
        .slice(0, 5),
      recentPosts: posts.slice(0, 10),
    };
  }

  /**
   * Get post analytics for a channel
   */
  async getChannelPosts(channelId: string, limit: number = 20) {
    return prisma.postAnalytics.findMany({
      where: { channelId },
      orderBy: { postDate: 'desc' },
      take: limit,
    });
  }
}

export const analyticsService = new AnalyticsService();
