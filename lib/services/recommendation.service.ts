import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

export class RecommendationService {
  /**
   * Generate recommendations for a channel
   */
  async generateRecommendations(channelId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) throw new Error('Channel not found');

    const ninetyDaysAgo = subDays(new Date(), 90);
    const posts = await prisma.postAnalytics.findMany({
      where: {
        channelId,
        postDate: { gte: ninetyDaysAgo },
      },
      orderBy: { postDate: 'desc' },
    });

    const analytics = await prisma.channelAnalytics.findMany({
      where: {
        channelId,
        date: { gte: ninetyDaysAgo },
      },
      orderBy: { date: 'desc' },
    });

    if (posts.length < 10) {
      throw new Error('Insufficient data. Need at least 10 posts.');
    }

    const recommendations = [];

    // Analyze different aspects
    const postingTimeRec = this.analyzePostingTimes(posts);
    if (postingTimeRec) recommendations.push(postingTimeRec);

    const contentTypeRec = this.analyzeContentTypes(posts);
    if (contentTypeRec) recommendations.push(contentTypeRec);

    const hashtagRec = this.analyzeHashtags(posts);
    if (hashtagRec) recommendations.push(hashtagRec);

    const frequencyRec = this.analyzePostingFrequency(posts);
    if (frequencyRec) recommendations.push(frequencyRec);

    const engagementRec = this.analyzeEngagementPatterns(posts);
    if (engagementRec) recommendations.push(engagementRec);

    const growthRec = this.analyzeGrowthTrends(analytics);
    if (growthRec) recommendations.push(growthRec);

    const contentLengthRec = this.analyzeContentLength(posts);
    if (contentLengthRec) recommendations.push(contentLengthRec);

    // Deactivate old recommendations
    await prisma.aIRecommendation.updateMany({
      where: { channelId, isActive: true },
      data: { isActive: false },
    });

    // Create new recommendations
    for (const rec of recommendations) {
      await prisma.aIRecommendation.create({
        data: {
          channelId,
          ...rec,
        },
      });
    }

    return recommendations;
  }

  private analyzePostingTimes(posts: any[]) {
    const hourlyStats: { [hour: number]: { views: number[]; count: number } } = {};

    posts.forEach((post: any) => {
      const hour = new Date(post.postDate).getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { views: [], count: 0 };
      }
      hourlyStats[hour].views.push(post.views);
      hourlyStats[hour].count++;
    });

    const hourlyAvg = Object.entries(hourlyStats).map(([hour, stats]) => ({
      hour: parseInt(hour),
      avgViews: stats.views.reduce((a: number, b: number) => a + b, 0) / stats.count,
      count: stats.count,
    }));

    const reliableHours = hourlyAvg.filter((h) => h.count >= 3);
    if (reliableHours.length === 0) return null;

    const sortedHours = reliableHours.sort((a, b) => b.avgViews - a.avgViews);
    const bestHour = sortedHours[0];
    const avgViews = reliableHours.reduce((a: number, b) => a + b.avgViews, 0) / reliableHours.length;

    const improvement = ((bestHour.avgViews - avgViews) / avgViews) * 100;

    if (improvement < 20) return null;

    return {
      recommendationType: 'posting_time',
      title: `Post at ${bestHour.hour}:00 for ${improvement.toFixed(0)}% more views`,
      description: `Analysis shows posts at ${bestHour.hour}:00 get ${bestHour.avgViews.toFixed(0)} views on average, compared to ${avgViews.toFixed(0)} views at other times.`,
      confidenceScore: Math.min(0.95, 0.6 + bestHour.count / 50),
      expectedImpactPercentage: Math.floor(improvement),
      isActive: true,
    };
  }

  private analyzeContentTypes(posts: any[]) {
    const typeStats: { [type: string]: { engagement: number[]; count: number } } = {};

    posts.forEach((post: any) => {
      const type = post.contentType;
      if (!typeStats[type]) {
        typeStats[type] = { engagement: [], count: 0 };
      }
      typeStats[type].engagement.push(post.engagementRate);
      typeStats[type].count++;
    });

    const typeAvg = Object.entries(typeStats)
      .map(([type, stats]) => ({
        type,
        avgEngagement: stats.engagement.reduce((a: number, b: number) => a + b, 0) / stats.count,
        count: stats.count,
      }))
      .filter((t) => t.count >= 3);

    if (typeAvg.length < 2) return null;

    const sortedTypes = typeAvg.sort((a, b) => b.avgEngagement - a.avgEngagement);
    const bestType = sortedTypes[0];
    const currentMix = typeStats[bestType.type].count / posts.length;

    if (currentMix >= 0.4) return null;

    const targetMix = Math.min(0.6, currentMix + 0.2);
    const improvement = ((bestType.avgEngagement - typeAvg[1].avgEngagement) / typeAvg[1].avgEngagement) * 100;

    return {
      recommendationType: 'content_type',
      title: `Increase ${bestType.type} content to ${(targetMix * 100).toFixed(0)}%`,
      description: `${bestType.type} posts get ${bestType.avgEngagement.toFixed(2)}% engagement vs ${typeAvg[1].avgEngagement.toFixed(2)}% for ${typeAvg[1].type}. Currently ${(currentMix * 100).toFixed(0)}% of your content is ${bestType.type}.`,
      confidenceScore: 0.85,
      expectedImpactPercentage: Math.floor(improvement),
      isActive: true,
    };
  }

  private analyzeHashtags(posts: any[]) {
    const withHashtags = posts.filter((p: any) => p.hashtags && p.hashtags.length > 0);
    const withoutHashtags = posts.filter((p: any) => !p.hashtags || p.hashtags.length === 0);

    if (withHashtags.length < 5 || withoutHashtags.length < 5) return null;

    const avgWithHashtags =
      withHashtags.reduce((sum: number, p: any) => sum + p.engagementRate, 0) / withHashtags.length;
    const avgWithoutHashtags =
      withoutHashtags.reduce((sum: number, p: any) => sum + p.engagementRate, 0) / withoutHashtags.length;

    const improvement = ((avgWithHashtags - avgWithoutHashtags) / avgWithoutHashtags) * 100;

    if (improvement < 15) return null;

    return {
      recommendationType: 'hashtag_strategy',
      title: `Use hashtags to boost engagement by ${improvement.toFixed(0)}%`,
      description: `Posts with hashtags get ${avgWithHashtags.toFixed(2)}% engagement vs ${avgWithoutHashtags.toFixed(2)}% without.`,
      confidenceScore: 0.82,
      expectedImpactPercentage: Math.floor(improvement),
      isActive: true,
    };
  }

  /**
   * Analyze posting frequency patterns
   */
  private analyzePostingFrequency(posts: any[]) {
    if (posts.length < 20) return null;

    // Calculate average posts per day
    const dates = posts.map(p => new Date(p.postDate).toDateString());
    const uniqueDates = new Set(dates);
    const daysWithPosts = uniqueDates.size;
    const totalDays = Math.ceil((new Date(posts[0].postDate).getTime() - new Date(posts[posts.length - 1].postDate).getTime()) / (1000 * 60 * 60 * 24));
    const avgPostsPerDay = posts.length / totalDays;

    // Analyze posts per day vs engagement
    const dailyData: { [date: string]: { count: number; avgEngagement: number } } = {};
    posts.forEach(post => {
      const date = new Date(post.postDate).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, avgEngagement: 0 };
      }
      dailyData[date].count++;
      dailyData[date].avgEngagement += post.engagementRate;
    });

    // Calculate average engagement for different posting frequencies
    const lowFreqDays = Object.values(dailyData).filter(d => d.count === 1);
    const highFreqDays = Object.values(dailyData).filter(d => d.count >= 2);

    if (lowFreqDays.length < 5 || highFreqDays.length < 5) return null;

    const avgEngagementLowFreq = lowFreqDays.reduce((sum, d) => sum + d.avgEngagement / d.count, 0) / lowFreqDays.length;
    const avgEngagementHighFreq = highFreqDays.reduce((sum, d) => sum + d.avgEngagement / d.count, 0) / highFreqDays.length;

    let recommendation = null;

    if (avgEngagementLowFreq > avgEngagementHighFreq * 1.15) {
      // Lower frequency is better
      const improvement = ((avgEngagementLowFreq - avgEngagementHighFreq) / avgEngagementHighFreq) * 100;
      recommendation = {
        recommendationType: 'posting_frequency',
        title: 'Post less frequently for better engagement',
        description: `Quality over quantity: Single posts per day get ${avgEngagementLowFreq.toFixed(2)}% engagement vs ${avgEngagementHighFreq.toFixed(2)}% when posting multiple times. Current average: ${avgPostsPerDay.toFixed(1)} posts/day.`,
        confidenceScore: 0.78,
        expectedImpactPercentage: Math.floor(improvement),
        isActive: true,
      };
    } else if (avgPostsPerDay < 0.5 && posts.length > 15) {
      // Posting too infrequently
      recommendation = {
        recommendationType: 'posting_frequency',
        title: 'Increase posting frequency to 1-2 times per day',
        description: `You're currently posting ${avgPostsPerDay.toFixed(1)} times per day. Regular posting (1-2x daily) can increase audience retention and reach.`,
        confidenceScore: 0.72,
        expectedImpactPercentage: 25,
        isActive: true,
      };
    }

    return recommendation;
  }

  /**
   * Analyze engagement patterns
   */
  private analyzeEngagementPatterns(posts: any[]) {
    if (posts.length < 15) return null;

    // Sort posts by engagement rate
    const sortedByEngagement = [...posts].sort((a, b) => b.engagementRate - a.engagementRate);
    const topPerformers = sortedByEngagement.slice(0, Math.ceil(posts.length * 0.2));
    const lowPerformers = sortedByEngagement.slice(-Math.ceil(posts.length * 0.2));

    // Analyze characteristics of top performers
    const topHasMedia = topPerformers.filter(p => p.hasMedia).length / topPerformers.length;
    const lowHasMedia = lowPerformers.filter(p => p.hasMedia).length / lowPerformers.length;

    if (topHasMedia > lowHasMedia * 1.5) {
      const improvement = ((topHasMedia - lowHasMedia) / lowHasMedia) * 100;
      return {
        recommendationType: 'engagement_pattern',
        title: 'Add media to boost engagement',
        description: `${(topHasMedia * 100).toFixed(0)}% of top posts have media vs ${(lowHasMedia * 100).toFixed(0)}% of low performers. Media content drives higher engagement.`,
        confidenceScore: 0.88,
        expectedImpactPercentage: Math.min(50, Math.floor(improvement / 2)),
        isActive: true,
      };
    }

    // Analyze post length
    const avgTopLength = topPerformers.reduce((sum, p) => sum + p.postLength, 0) / topPerformers.length;
    const avgLowLength = lowPerformers.reduce((sum, p) => sum + p.postLength, 0) / lowPerformers.length;

    if (avgTopLength > avgLowLength * 1.3 && avgTopLength > 200) {
      return {
        recommendationType: 'engagement_pattern',
        title: 'Write longer, more detailed posts',
        description: `Top performing posts average ${Math.floor(avgTopLength)} characters vs ${Math.floor(avgLowLength)} for low performers. Detailed content drives ${((avgTopLength / avgLowLength - 1) * 100).toFixed(0)}% better engagement.`,
        confidenceScore: 0.75,
        expectedImpactPercentage: 30,
        isActive: true,
      };
    }

    return null;
  }

  /**
   * Analyze growth trends
   */
  private analyzeGrowthTrends(analytics: any[]) {
    if (analytics.length < 14) return null;

    // Calculate weekly growth rates
    const recentWeek = analytics.slice(0, 7);
    const previousWeek = analytics.slice(7, 14);

    const recentGrowth = recentWeek.reduce((sum, a) => sum + a.newSubscribers, 0);
    const previousGrowth = previousWeek.reduce((sum, a) => sum + a.newSubscribers, 0);

    if (previousGrowth === 0) return null;

    const growthChange = ((recentGrowth - previousGrowth) / previousGrowth) * 100;

    if (growthChange < -20) {
      // Declining growth
      return {
        recommendationType: 'growth_trend',
        title: 'Growth is declining - time to re-engage your audience',
        description: `Subscriber growth dropped ${Math.abs(growthChange).toFixed(0)}% this week (${previousGrowth} → ${recentGrowth} new subscribers). Consider: posting more engaging content, running a giveaway, or collaborating with other channels.`,
        confidenceScore: 0.82,
        expectedImpactPercentage: 35,
        isActive: true,
      };
    } else if (growthChange > 50) {
      // Accelerating growth
      const recentAvgEngagement = recentWeek.reduce((sum, a) => sum + a.engagementRate, 0) / recentWeek.length;
      return {
        recommendationType: 'growth_trend',
        title: `Growth is accelerating (+${growthChange.toFixed(0)}%) - maintain momentum!`,
        description: `You gained ${recentGrowth} subscribers this week vs ${previousGrowth} last week. Keep posting similar content to maintain this ${recentAvgEngagement.toFixed(1)}% engagement rate.`,
        confidenceScore: 0.90,
        expectedImpactPercentage: 40,
        isActive: true,
      };
    }

    return null;
  }

  /**
   * Analyze content length patterns
   */
  private analyzeContentLength(posts: any[]) {
    if (posts.length < 15) return null;

    // Categorize posts by length
    const shortPosts = posts.filter(p => p.postLength < 100);
    const mediumPosts = posts.filter(p => p.postLength >= 100 && p.postLength < 300);
    const longPosts = posts.filter(p => p.postLength >= 300);

    const categories = [
      { name: 'short', posts: shortPosts, range: '<100 chars' },
      { name: 'medium', posts: mediumPosts, range: '100-300 chars' },
      { name: 'long', posts: longPosts, range: '>300 chars' },
    ].filter(c => c.posts.length >= 3);

    if (categories.length < 2) return null;

    // Calculate average engagement for each category
    const withEngagement = categories.map(c => ({
      ...c,
      avgEngagement: c.posts.reduce((sum, p) => sum + p.engagementRate, 0) / c.posts.length,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);

    const best = withEngagement[0];
    const worst = withEngagement[withEngagement.length - 1];
    const improvement = ((best.avgEngagement - worst.avgEngagement) / worst.avgEngagement) * 100;

    if (improvement < 20) return null;

    return {
      recommendationType: 'content_length',
      title: `Optimize post length: ${best.name} posts (${best.range}) perform best`,
      description: `${best.name} posts get ${best.avgEngagement.toFixed(2)}% engagement vs ${worst.avgEngagement.toFixed(2)}% for ${worst.name} posts. Aim for ${best.range} for optimal engagement.`,
      confidenceScore: 0.80,
      expectedImpactPercentage: Math.floor(improvement),
      isActive: true,
    };
  }

  async getRecommendations(channelId: string) {
    return prisma.aIRecommendation.findMany({
      where: {
        channelId,
        isActive: true,
        isDismissed: false,
      },
      orderBy: { expectedImpactPercentage: 'desc' },
    });
  }

  async getAllRecommendations(userId: string) {
    const channels = await prisma.channel.findMany({
      where: { userId },
      select: { id: true, channelName: true },
    });

    const channelIds = channels.map((c: any) => c.id);

    const recommendations = await prisma.aIRecommendation.findMany({
      where: {
        channelId: { in: channelIds },
        isActive: true,
        isDismissed: false,
      },
      orderBy: { expectedImpactPercentage: 'desc' },
    });

    return recommendations.map((rec: any) => ({
      ...rec,
      channelName: channels.find((c: any) => c.id === rec.channelId)?.channelName,
    }));
  }

  async dismissRecommendation(recommendationId: string) {
    return prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: { isDismissed: true },
    });
  }
}

export const recommendationService = new RecommendationService();
