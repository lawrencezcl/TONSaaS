import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof, tonAddress } = body;

    if (!proof || !tonAddress) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing proof or tonAddress' } },
        { status: 400 }
      );
    }

    // Authenticate user
    const { token, user } = await authService.authenticateWithTon(proof, tonAddress);

    // Return token and user info
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        tonAddress: user.tonAddress,
        subscriptionTier: user.subscriptionTier,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    });
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message || 'Authentication failed',
        },
      },
      { status: 401 }
    );
  }
}
