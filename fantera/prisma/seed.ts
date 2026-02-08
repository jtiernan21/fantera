import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

async function main() {
  console.log("Seeding database...");

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

  console.log("Seed complete.");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
