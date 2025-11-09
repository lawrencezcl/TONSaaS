import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';

export class SubscriptionService {
  private readonly PLANS = {
    pro: { price: 29, maxChannels: 5 },
    business: { price: 99, maxChannels: 20 },
    enterprise: { price: 299, maxChannels: 9999 },
  };

  async createSubscription(
    userId: string,
    plan: 'pro' | 'business' | 'enterprise'
  ) {
    const planDetails = this.PLANS[plan];

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        monthlyPrice: planDetails.price,
        status: 'pending_payment',
        currentPeriodStart: new Date(),
        currentPeriodEnd: addDays(new Date(), 30),
      },
    });

    return subscription;
  }

  async activateSubscription(subscriptionId: string, txHash: string) {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        tonTxHash: txHash,
      },
      include: { user: true },
    });

    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionTier: subscription.plan,
        subscriptionEndDate: subscription.currentPeriodEnd,
      },
    });

    return subscription;
  }

  async cancelSubscription(subscriptionId: string, immediate: boolean = false) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) throw new Error('Subscription not found');

    if (immediate) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'cancelled' },
      });

      await prisma.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionTier: 'free',
          subscriptionEndDate: null,
        },
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { cancelAtPeriodEnd: true },
      });
    }

    return subscription;
  }

  async getSubscriptionLimits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { channels: true },
    });

    if (!user) throw new Error('User not found');

    const tier = user.subscriptionTier;
    const limits: any = {
      free: { maxChannels: 1, features: [] },
      pro: { maxChannels: 5, features: ['analytics', 'recommendations'] },
      business: {
        maxChannels: 20,
        features: ['analytics', 'recommendations', 'competitor_analysis'],
      },
      enterprise: {
        maxChannels: 9999,
        features: [
          'analytics',
          'recommendations',
          'competitor_analysis',
          'priority_support',
          'api_access',
        ],
      },
    };

    const tierLimits = limits[tier as keyof typeof limits];

    return {
      maxChannels: tierLimits.maxChannels,
      currentChannels: user.channels.length,
      hasAdvancedAnalytics: tierLimits.features.includes('analytics'),
      hasAIRecommendations: tierLimits.features.includes('recommendations'),
      hasCompetitorAnalysis: tierLimits.features.includes('competitor_analysis'),
      hasPrioritySupport: tierLimits.features.includes('priority_support'),
      hasAPIAccess: tierLimits.features.includes('api_access'),
    };
  }

  async getUserSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'pending_payment'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const subscriptionService = new SubscriptionService();
