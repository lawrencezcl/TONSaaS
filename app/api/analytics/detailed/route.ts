import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { userId } = await authService.verifyToken(token);

    // Get user channels
    const channels = await prisma.channel.findMany({
      where: { userId },
      include: {
        posts: {
          orderBy: { views: 'desc' },
          take: 10,
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    const analytics = await Promise.all(
      channels.map(async (channel) => {
        // Calculate summary stats
        const totalViews = channel.posts.reduce((sum, post) => sum + post.views, 0);
        const totalReactions = channel.posts.reduce((sum, post) => sum + post.reactions, 0);
        const avgEngagement = channel.posts.length > 0
          ? channel.posts.reduce((sum, post) => sum + post.engagementRate, 0) / channel.posts.length
          : 0;

        const subscriberGrowth = channel.analytics.length > 1
          ? channel.analytics[0].subscriberCount - channel.analytics[channel.analytics.length - 1].subscriberCount
          : 0;

        return {
          channelId: channel.id,
          channelName: channel.channelName,
          subscriberGrowth: channel.analytics.map((a) => ({
            date: a.date.toISOString(),
            count: a.subscriberCount,
          })),
          engagementTrend: channel.analytics.map((a) => ({
            date: a.date.toISOString(),
            rate: a.engagementRate,
          })),
          topPosts: channel.posts.map((post) => ({
            id: post.id,
            date: post.postDate.toISOString(),
            contentType: post.contentType,
            views: post.views,
            reactions: post.reactions,
            engagementRate: post.engagementRate,
          })),
          summary: {
            totalViews,
            totalReactions,
            avgEngagement,
            subscriberGrowth,
          },
        };
      })
    );

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error('Get detailed analytics error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
