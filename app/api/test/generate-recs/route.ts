import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recommendationService } from '@/lib/services/recommendation.service';

export async function GET() {
  try {
    // Get all active channels
    const channels = await prisma.channel.findMany({
      where: { isActive: true },
    });

    let totalRecs = 0;

    for (const channel of channels) {
      const recs = await recommendationService.generateRecommendations(channel.id);
      totalRecs += recs.length;
    }

    return NextResponse.json({
      success: true,
      channelsProcessed: channels.length,
      recommendationsGenerated: totalRecs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
