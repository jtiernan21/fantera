import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { CLUB_CONFIGS } from "../src/config/clubs";

function getDirectUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Check your .env file.");
  }
  if (dbUrl.startsWith("prisma+postgres://")) {
    const match = dbUrl.match(/api_key=(.+)/);
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
      return decoded.databaseUrl;
    }
  }
  return dbUrl;
}

const pool = new pg.Pool({ connectionString: getDirectUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CLUBS = [
  { name: "Juventus FC", ticker: "JUVE.MI", exchange: "Borsa Italiana" },
  { name: "Borussia Dortmund", ticker: "BVB.DE", exchange: "Frankfurt SE" },
  { name: "AFC Ajax", ticker: "AJAX.AS", exchange: "Euronext Amsterdam" },
  { name: "SL Benfica", ticker: "SLB.LS", exchange: "Euronext Lisbon" },
  { name: "FC Porto", ticker: "FCP.LS", exchange: "Euronext Lisbon" },
  { name: "Sporting CP", ticker: "SCP.LS", exchange: "Euronext Lisbon" },
  { name: "SC Braga", ticker: "SCB.LS", exchange: "Euronext Lisbon" },
  { name: "SS Lazio", ticker: "SSL.MI", exchange: "Borsa Italiana" },
  { name: "AS Roma", ticker: "ASR.MI", exchange: "Borsa Italiana" },
  { name: "Olympique Lyonnais", ticker: "OLG.PA", exchange: "Euronext Paris" },
  { name: "Celtic FC", ticker: "CCP.L", exchange: "London SE" },
  { name: "FC Copenhagen", ticker: "PARKEN.CO", exchange: "Copenhagen SE" },
  { name: "Galatasaray SK", ticker: "GSRAY.IS", exchange: "Borsa Istanbul" },
  { name: "Manchester United", ticker: "MANU", exchange: "NYSE" },
  { name: "Club América", ticker: "TICA.MX", exchange: "BMV Mexico" },
];

const INITIAL_PRICES: Record<string, { price: number; changePct: number }> = {
  "JUVE.MI": { price: 0.32, changePct: 1.2 },
  "BVB.DE": { price: 3.65, changePct: -0.8 },
  "AJAX.AS": { price: 9.5, changePct: 0.5 },
  "SLB.LS": { price: 3.15, changePct: 2.1 },
  "FCP.LS": { price: 1.1, changePct: -0.3 },
  "SCP.LS": { price: 0.85, changePct: 1.8 },
  "SCB.LS": { price: 1.45, changePct: 0.0 },
  "SSL.MI": { price: 1.2, changePct: -1.5 },
  "ASR.MI": { price: 0.75, changePct: 3.2 },
  "OLG.PA": { price: 2.1, changePct: -0.6 },
  "CCP.L": { price: 1.3, changePct: 0.9 },
  "PARKEN.CO": { price: 18.5, changePct: -0.2 },
  "GSRAY.IS": { price: 1.85, changePct: 4.5 },
  MANU: { price: 16.2, changePct: -1.1 },
  "TICA.MX": { price: 0.6, changePct: 0.7 },
};

async function main() {
  console.log("Seeding database...");

  // Seed test user (idempotent — from Story 1.2)
  await prisma.user.upsert({
    where: { privyId: "test-privy-user-001" },
    update: { kycStatus: "ACTIVE" },
    create: {
      privyId: "test-privy-user-001",
      email: "testuser@example.com",
      displayName: "Test User",
      kycStatus: "ACTIVE",
    },
  });

  // Seed clubs and initial prices
  for (const club of CLUBS) {
    const config = CLUB_CONFIGS[club.ticker];
    if (!config) {
      console.warn(`No color config found for ${club.ticker}, skipping`);
      continue;
    }

    const upsertedClub = await prisma.club.upsert({
      where: { ticker: club.ticker },
      update: {
        name: club.name,
        exchange: club.exchange,
        crestUrl: config.crestUrl,
        colorConfig: config,
        isActive: true,
      },
      create: {
        name: club.name,
        ticker: club.ticker,
        exchange: club.exchange,
        crestUrl: config.crestUrl,
        colorConfig: config,
        isActive: true,
      },
    });

    // Only create initial price if none exists
    const existingPrice = await prisma.price.findFirst({
      where: { clubId: upsertedClub.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!existingPrice) {
      const priceData = INITIAL_PRICES[club.ticker] || {
        price: 1.0,
        changePct: 0,
      };
      await prisma.price.create({
        data: {
          clubId: upsertedClub.id,
          price: priceData.price,
          changePct: priceData.changePct,
        },
      });
    }
  }

  console.log(`Seeded ${CLUBS.length} clubs with initial prices.`);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
