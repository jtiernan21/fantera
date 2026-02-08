import { PrivyClient } from "@privy-io/server-auth";
import type { KycSubmitData } from "@/validations/kyc";
import { KycStatus } from "@/generated/prisma/client";

const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function verifyAuth(
  request: Request
): Promise<{ userId: string } | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "");
    const verifiedClaims = await privyClient.verifyAuthToken(token);

    return { userId: verifiedClaims.userId };
  } catch {
    return null;
  }
}

const PRIVY_API_BASE = "https://auth.privy.io/api/v1";

function privyAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "privy-app-id": process.env.PRIVY_APP_ID!,
    Authorization: `Basic ${Buffer.from(
      `${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`
    ).toString("base64")}`,
  };
}

export async function initiateKyc(
  privyUserId: string,
  kycData: KycSubmitData
) {
  const response = await fetch(
    `${PRIVY_API_BASE}/users/${privyUserId}/fiat/kyc`,
    {
      method: "POST",
      headers: privyAuthHeaders(),
      body: JSON.stringify({
        provider: process.env.PRIVY_KYC_PROVIDER || "bridge-sandbox",
        data: {
          type: "individual",
          first_name: kycData.firstName,
          last_name: kycData.lastName,
          email: kycData.email,
          residential_address: {
            street_line_1: kycData.streetAddress,
            city: kycData.city,
            subdivision: kycData.state,
            postal_code: kycData.postalCode,
            country: kycData.country,
          },
          birth_date: kycData.dateOfBirth,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `KYC initiation failed: ${response.status} — ${JSON.stringify(error)}`
    );
  }

  return response.json();
}

export async function getKycStatus(privyUserId: string) {
  const provider = process.env.PRIVY_KYC_PROVIDER || "bridge-sandbox";
  const response = await fetch(
    `${PRIVY_API_BASE}/users/${privyUserId}/fiat/kyc?provider=${provider}`,
    {
      method: "GET",
      headers: privyAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return { status: "not_found", providerUserId: null };
    }
    throw new Error(`KYC status check failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    status: data.status as string,
    providerUserId: data.provider_user_id as string | null,
  };
}

export function mapPrivyKycStatus(privyStatus: string): KycStatus {
  switch (privyStatus) {
    case "not_found":
    case "not_started":
    case "incomplete":
      return "NOT_STARTED";
    case "under_review":
    case "awaiting_questionnaire":
    case "awaiting_ubo":
    case "paused":
      return "UNDER_REVIEW";
    case "active":
      return "ACTIVE";
    case "rejected":
    case "offboarded":
      return "REJECTED";
    default:
      return "NOT_STARTED";
  }
}

export { privyClient };
