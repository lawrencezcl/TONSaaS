import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recommendationService } from '@/lib/services/recommendation.service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const startTime = Date.now();

    // Get all channels
    const channels = await prisma.channel.findMany({
      where: { isActive: true },
    });

    let processed = 0;
    let recommendationsGenerated = 0;

    for (const channel of channels) {
      try {
        const recs = await recommendationService.generateRecommendations(
          channel.id
        );
        processed++;
        recommendationsGenerated += recs.length;
      } catch (error) {
        console.error(
          `Failed to generate recommendations for channel ${channel.id}:`,
          error
        );
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      channelsProcessed: processed,
      recommendationsGenerated,
      duration,
    });
  } catch (error: any) {
    console.error('Generate recommendations cron error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
