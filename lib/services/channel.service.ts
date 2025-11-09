import { prisma } from '@/lib/db';
import { telegramService } from './telegram.service';

export class ChannelService {
  /**
   * Add channel to user account
   */
  async addChannel(userId: string, telegramChannelId: string) {
    // 1. Validate subscription limits
    await this.validateChannelLimit(userId);

    // 2. Fetch channel info from Telegram
    const channelInfo = await telegramService.getChannelInfo(telegramChannelId);

    // 3. Verify user is admin of the channel
    const isAdmin = await telegramService.verifyUserIsAdmin(
      telegramChannelId,
      userId
    );
    if (!isAdmin) {
      throw new Error('You must be an admin of this channel');
    }

    // 4. Create channel in database
    const channel = await prisma.channel.create({
      data: {
        userId,
        telegramChannelId: channelInfo.id.toString(),
        channelName: channelInfo.title,
        channelUsername: channelInfo.username,
        subscriberCount: channelInfo.members_count || 0,
        isActive: true,
      },
    });

    // 5. Trigger initial sync
    await this.syncChannel(channel.id);

    return channel;
  }

  /**
   * Validate user hasn't exceeded channel limit
   */
  private async validateChannelLimit(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { channels: true },
    });

    if (!user) throw new Error('User not found');

    const limits = {
      free: 1,
      pro: 5,
      business: 20,
      enterprise: 9999,
    };

    const maxChannels = limits[user.subscriptionTier as keyof typeof limits];

    if (user.channels.length >= maxChannels) {
      throw new Error(
        `Channel limit reached. Upgrade to add more channels.`
      );
    }
  }

  /**
   * Sync channel data from Telegram
   */
  async syncChannel(channelId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) throw new Error('Channel not found');

    // 1. Fetch latest stats from Telegram
    const stats = await telegramService.getChannelStats(
      channel.telegramChannelId
    );

    // 2. Calculate new subscribers
    const previousCount = channel.subscriberCount;
    const newSubscribers = stats.subscriberCount - previousCount;

    // 3. Update channel subscriber count
    await prisma.channel.update({
      where: { id: channelId },
      data: {
        subscriberCount: stats.subscriberCount,
        lastSyncAt: new Date(),
      },
    });

    // 4. Store daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.channelAnalytics.upsert({
      where: {
        channelId_date: {
          channelId,
          date: today,
        },
      },
      update: {
        subscriberCount: stats.subscriberCount,
        newSubscribers,
        postsCount: stats.postsCount,
        totalViews: stats.totalViews,
        totalReactions: stats.totalReactions,
        engagementRate: stats.engagementRate,
        estimatedAdRevenue: stats.estimatedAdRevenue,
      },
      create: {
        channelId,
        date: today,
        subscriberCount: stats.subscriberCount,
        newSubscribers,
        postsCount: stats.postsCount,
        totalViews: stats.totalViews,
        totalReactions: stats.totalReactions,
        engagementRate: stats.engagementRate,
        estimatedAdRevenue: stats.estimatedAdRevenue,
      },
    });

    // 5. Sync recent posts
    await this.syncPosts(channelId);

    return { success: true, stats };
  }

  /**
   * Sync posts from Telegram
   */
  private async syncPosts(channelId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) return;

    // Fetch last 50 posts
    const posts = await telegramService.getChannelPosts(
      channel.telegramChannelId,
      50
    );

    for (const post of posts) {
      const engagementRate = this.calculateEngagementRate(
        post,
        channel.subscriberCount
      );

      await prisma.postAnalytics.upsert({
        where: {
          channelId_telegramMessageId: {
            channelId,
            telegramMessageId: post.id.toString(),
          },
        },
        update: {
          views: post.views || 0,
          reactions: post.reactions || 0,
          shares: post.forwards || 0,
          forwards: post.forwards || 0,
          engagementRate,
        },
        create: {
          channelId,
          telegramMessageId: post.id.toString(),
          postDate: post.date,
          contentType: this.detectContentType(post),
          postLength: post.text?.length || 0,
          hasMedia: this.hasMedia(post),
          views: post.views || 0,
          reactions: post.reactions || 0,
          shares: post.forwards || 0,
          forwards: post.forwards || 0,
          engagementRate,
          hashtags: this.extractHashtags(post.text || ''),
        },
      });
    }
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(post: any, subscriberCount: number): number {
    if (subscriberCount === 0) return 0;
    const engagement = (post.reactions || 0) + (post.forwards || 0);
    return (engagement / subscriberCount) * 100;
  }

  /**
   * Detect content type
   */
  private detectContentType(post: any): string {
    if (post.video) return 'video';
    if (post.photo) return 'photo';
    if (post.document) return 'document';
    if (post.audio) return 'audio';
    return 'text';
  }

  /**
   * Check if post has media
   */
  private hasMedia(post: any): boolean {
    return !!(post.video || post.photo || post.document || post.audio);
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags.join(',');
  }

  /**
   * Get channels for user
   */
  async getUserChannels(userId: string) {
    return prisma.channel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get channel by ID
   */
  async getChannelById(channelId: string, userId: string) {
    return prisma.channel.findFirst({
      where: {
        id: channelId,
        userId,
      },
    });
  }
}

export const channelService = new ChannelService();
