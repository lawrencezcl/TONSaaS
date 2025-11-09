import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { channelService } from '@/lib/services/channel.service';

// GET /api/channels - List all channels for user
export async function GET(request: NextRequest) {
  try {
    // Get auth token
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
    const channels = await channelService.getUserChannels(userId);

    return NextResponse.json({
      channels,
      total: channels.length,
    });
  } catch (error: any) {
    console.error('Get channels error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/channels - Add a new channel
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { userId } = await authService.verifyToken(token);

    // Get request body
    const body = await request.json();
    const { telegramChannelId } = body;

    if (!telegramChannelId) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing telegramChannelId' } },
        { status: 400 }
      );
    }

    // Add channel
    const channel = await channelService.addChannel(userId, telegramChannelId);

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error: any) {
    console.error('Add channel error:', error);
    
    if (error.message.includes('limit reached')) {
      return NextResponse.json(
        { error: { code: 'PAYMENT_REQUIRED', message: error.message } },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
