import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { channelService } from '@/lib/services/channel.service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const startTime = Date.now();

    // Get all active channels
    const channels = await prisma.channel.findMany({
      where: { isActive: true },
    });

    let synced = 0;
    let failed = 0;

    // Sync each channel
    for (const channel of channels) {
      try {
        await channelService.syncChannel(channel.id);
        synced++;
      } catch (error) {
        console.error(`Failed to sync channel ${channel.id}:`, error);
        failed++;
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      synced,
      failed,
      duration,
    });
  } catch (error: any) {
    console.error('Sync channels cron error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
