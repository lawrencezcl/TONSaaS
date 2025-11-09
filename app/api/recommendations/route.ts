import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { recommendationService } from '@/lib/services/recommendation.service';

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

    const recommendations = await recommendationService.getAllRecommendations(userId);

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
