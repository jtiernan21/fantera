import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy";
import { prisma } from "@/lib/prisma";

interface PrivyWebhookPayload {
  type: string;
  user: {
    id: string;
    linked_accounts: Array<{
      type: string;
      email?: string;
      address?: string;
      name?: string;
    }>;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const svixId = req.headers.get("svix-id") ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSignature = req.headers.get("svix-signature") ?? "";

    const verifiedPayload = (await privyClient.verifyWebhook(
      body,
      { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      process.env.PRIVY_WEBHOOK_SIGNING_KEY!
    )) as PrivyWebhookPayload;

    if (verifiedPayload.type === "user.created") {
      const privyUser = verifiedPayload.user;
      const googleAccount = privyUser.linked_accounts.find(
        (a) => a.type === "google_oauth"
      );
      const appleAccount = privyUser.linked_accounts.find(
        (a) => a.type === "apple_oauth"
      );
      const emailAccount = privyUser.linked_accounts.find(
        (a) => a.type === "email"
      );

      const walletAccount = privyUser.linked_accounts.find(
        (a) => a.type === "wallet"
      );

      const email =
        emailAccount?.address ??
        googleAccount?.email ??
        appleAccount?.email ??
        null;
      const displayName =
        googleAccount?.name ?? appleAccount?.name ?? null;
      const walletAddress = walletAccount?.address ?? null;

      await prisma.user.upsert({
        where: { privyId: privyUser.id },
        update: { email, displayName, walletAddress },
        create: {
          privyId: privyUser.id,
          email,
          displayName,
          walletAddress,
        },
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth/webhook]", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
