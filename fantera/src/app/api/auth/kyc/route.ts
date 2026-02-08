import { NextRequest } from "next/server";
import { verifyAuth, initiateKyc, getKycStatus, mapPrivyKycStatus } from "@/lib/privy";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { kycSubmitSchema } from "@/validations/kyc";

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return apiError("UNAUTHORIZED", "Not authenticated", "SYSTEM_ERROR", 401);
    }

    const body = await req.json();
    const parsed = kycSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((e) => e.message).join(", "),
        "SYSTEM_ERROR",
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { privyId: authResult.userId },
    });

    if (!user) {
      return apiError("USER_NOT_FOUND", "User not found", "SYSTEM_ERROR", 404);
    }

    if (user.kycStatus === "ACTIVE") {
      return apiError(
        "KYC_ALREADY_ACTIVE",
        "User is already verified",
        "SYSTEM_ERROR",
        400
      );
    }

    const result = await initiateKyc(authResult.userId, parsed.data);

    await prisma.user.update({
      where: { privyId: authResult.userId },
      data: {
        kycStatus: "UNDER_REVIEW",
        kycProviderUserId: result.provider_user_id ?? null,
      },
    });

    return apiSuccess({ kycStatus: "UNDER_REVIEW" });
  } catch (error) {
    console.error("[POST /api/auth/kyc]", error);
    return apiError(
      "KYC_INITIATION_FAILED",
      "Could not start verification",
      "SYSTEM_ERROR",
      500
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return apiError("UNAUTHORIZED", "Not authenticated", "SYSTEM_ERROR", 401);
    }

    const user = await prisma.user.findUnique({
      where: { privyId: authResult.userId },
    });

    if (!user) {
      return apiError("USER_NOT_FOUND", "User not found", "SYSTEM_ERROR", 404);
    }

    if (user.kycStatus === "ACTIVE" || user.kycStatus === "NOT_STARTED") {
      return apiSuccess({ kycStatus: user.kycStatus });
    }

    const privyStatus = await getKycStatus(authResult.userId);
    const mappedStatus = mapPrivyKycStatus(privyStatus.status);

    if (mappedStatus !== user.kycStatus) {
      await prisma.user.update({
        where: { privyId: authResult.userId },
        data: {
          kycStatus: mappedStatus,
          kycProviderUserId: privyStatus.providerUserId ?? user.kycProviderUserId,
        },
      });
    }

    return apiSuccess({ kycStatus: mappedStatus });
  } catch (error) {
    console.error("[GET /api/auth/kyc]", error);
    return apiError(
      "KYC_STATUS_FAILED",
      "Could not check verification status",
      "SYSTEM_ERROR",
      500
    );
  }
}
