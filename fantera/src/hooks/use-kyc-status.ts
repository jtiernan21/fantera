import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

export type KycStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "REJECTED";

export function useKycStatus(
  optionsOrPollInterval?: number | { pollInterval?: number; enabled?: boolean }
) {
  const { pollInterval, enabled = true } =
    typeof optionsOrPollInterval === "number"
      ? { pollInterval: optionsOrPollInterval }
      : optionsOrPollInterval ?? {};

  const { getAccessToken } = usePrivy();
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/auth/kyc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setKycStatus(data.data.kycStatus);
        setError(false);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (enabled) {
      checkStatus();
    }
  }, [checkStatus, enabled]);

  useEffect(() => {
    if (!pollInterval || !kycStatus || !enabled) return;
    if (kycStatus !== "UNDER_REVIEW" && kycStatus !== "PENDING") return;

    const interval = setInterval(checkStatus, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, kycStatus, checkStatus, enabled]);

  return { kycStatus, isLoading, error, refetch: checkStatus };
}
