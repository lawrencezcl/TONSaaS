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
    });

    if (posts.length < 10) {
      throw new Error('Insufficient data. Need at least 10 posts.');
    }

    const recommendations = [];

    const postingTimeRec = this.analyzePostingTimes(posts);
    if (postingTimeRec) recommendations.push(postingTimeRec);

    const contentTypeRec = this.analyzeContentTypes(posts);
    if (contentTypeRec) recommendations.push(contentTypeRec);

    const hashtagRec = this.analyzeHashtags(posts);
    if (hashtagRec) recommendations.push(hashtagRec);

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
