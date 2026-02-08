import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/privy';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getClubMetadata } from '@/config/club-metadata';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return apiError('UNAUTHORIZED', 'Not authenticated', 'SYSTEM_ERROR', 401);
    }

    const { clubId } = await params;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        prices: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!club || !club.isActive) {
      return apiError('NOT_FOUND', 'Club not found', 'SYSTEM_ERROR', 404);
    }

    const latestPrice = club.prices[0];
    const metadata = getClubMetadata(club.ticker);
    const rawColors = (club.colorConfig as Record<string, string>) ?? {};

    return apiSuccess({
      id: club.id,
      name: club.name,
      ticker: club.ticker,
      exchange: club.exchange,
      crestUrl: club.crestUrl,
      colorConfig: {
        primary: rawColors.primary ?? '#1a1a2e',
        secondary: rawColors.secondary ?? '#ffffff',
        gradientStart: rawColors.gradientStart ?? rawColors.primary ?? '#1a1a2e',
        gradientEnd: rawColors.gradientEnd ?? '#000000',
        glowColor: rawColors.glowColor ?? rawColors.primary ?? '#1a1a2e',
      },
      price: latestPrice?.price ?? 0,
      changePct: latestPrice?.changePct ?? 0,
      about: metadata,
    });
  } catch (error) {
    console.error('[GET /api/clubs/[clubId]]', error);
    return apiError('INTERNAL_ERROR', 'Failed to fetch club', 'SYSTEM_ERROR', 500);
  }
}
