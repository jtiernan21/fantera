import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/privy";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return apiError("UNAUTHORIZED", "Not authenticated", "UNAUTHORIZED", 401);
    }

    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    const clubsWithPrices = clubs
      .map((club) => {
        const latestPrice = club.prices[0];
        return {
          id: club.id,
          name: club.name,
          ticker: club.ticker,
          exchange: club.exchange,
          crestUrl: club.crestUrl,
          colorConfig: club.colorConfig,
          price: latestPrice?.price ?? 0,
          changePct: latestPrice?.changePct ?? 0,
        };
      })
      .sort((a, b) => b.price - a.price);

    return apiSuccess(clubsWithPrices);
  } catch (error) {
    console.error("[GET /api/clubs]", error);
    return apiError(
      "INTERNAL_ERROR",
      "Failed to fetch clubs",
      "SYSTEM_ERROR",
      500
    );
  }
}
