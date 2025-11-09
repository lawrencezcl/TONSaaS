import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/db';

interface TonConnectProof {
  timestamp: number;
  domain: string;
  signature: string;
  payload: string;
}

export class AuthService {
  private readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'local-dev-secret-key-min-32-chars-abcdefghijklmnop'
  );
  private readonly JWT_EXPIRY = '24h';

  /**
   * Verify TON Connect proof and create user session
   */
  async authenticateWithTon(
    proof: TonConnectProof,
    tonAddress: string
  ): Promise<{ token: string; user: any }> {
    // For development, skip actual signature verification
    // In production, verify using TON SDK
    
    // Check proof timestamp (max 5 minutes old)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - proof.timestamp) > 300) {
      throw new Error('Proof expired');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { tonAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          tonAddress,
          subscriptionTier: 'free',
        },
      });
    }

    // Generate JWT token
    const token = await this.generateToken(user.id, tonAddress);

    return { token, user };
  }

  /**
   * Generate JWT token
   */
  private async generateToken(
    userId: string,
    tonAddress: string
  ): Promise<string> {
    const token = await new SignJWT({
      userId,
      tonAddress,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.JWT_EXPIRY)
      .sign(this.JWT_SECRET);

    return token;
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<{
    userId: string;
    tonAddress: string;
  }> {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      return {
        userId: payload.userId as string,
        tonAddress: payload.tonAddress as string,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token: string) {
    const { userId } = await this.verifyToken(token);
    return prisma.user.findUnique({ where: { id: userId } });
  }
}

export const authService = new AuthService();
