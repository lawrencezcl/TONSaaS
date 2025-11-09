import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify token and get user
    const user = await authService.getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        tonAddress: user.tonAddress,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: error.message || 'Session validation failed',
        },
      },
      { status: 401 }
    );
  }
}
