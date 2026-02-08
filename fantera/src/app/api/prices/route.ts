import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/privy";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return apiError("UNAUTHORIZED", "Not authenticated", "SYSTEM_ERROR", 401);
    }

    const prices = await prisma.price.findMany({
      include: {
        club: {
          select: { id: true, ticker: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Deduplicate: keep only the latest price per club (safety net)
    const seen = new Set<string>();
    const latestPrices = prices.filter((p) => {
      if (seen.has(p.clubId)) return false;
      seen.add(p.clubId);
      return true;
    });

    return apiSuccess(
      latestPrices.map((p) => ({
        clubId: p.clubId,
        ticker: p.club.ticker,
        price: p.price,
        changePct: p.changePct,
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[GET /api/prices]", error);
    return apiError(
      "INTERNAL_ERROR",
      "Failed to fetch prices",
      "SYSTEM_ERROR",
      500
    );
  }
}
