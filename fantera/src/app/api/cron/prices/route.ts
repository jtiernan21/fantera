import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/alpaca";

export async function GET(request: NextRequest) {
  // Authenticate via CRON_SECRET — NOT verifyAuth() (system route, not user route)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      select: { id: true, ticker: true },
    });

    if (clubs.length === 0) {
      return Response.json({
        success: true,
        data: { updated: 0, timestamp: new Date().toISOString() },
      });
    }

    const tickers = clubs.map((c) => c.ticker);
    const prices = await getPrices(tickers);

    const tickerToClubId = new Map(clubs.map((c) => [c.ticker, c.id]));

    const upserts = prices
      .filter((p) => tickerToClubId.has(p.ticker))
      .map((p) =>
        prisma.price.upsert({
          where: { clubId: tickerToClubId.get(p.ticker)! },
          update: {
            price: p.price,
            changePct: p.changePct,
            updatedAt: new Date(),
          },
          create: {
            clubId: tickerToClubId.get(p.ticker)!,
            price: p.price,
            changePct: p.changePct,
          },
        })
      );

    await Promise.all(upserts);

    return Response.json({
      success: true,
      data: { updated: upserts.length, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[CRON /api/cron/prices] Price fetch failed:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "PRICE_FETCH_FAILED",
          message: "Failed to update prices",
          type: "SYSTEM_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
