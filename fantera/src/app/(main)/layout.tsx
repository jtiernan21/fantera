"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { LogOut } from "lucide-react";
import { useKycStatus } from "@/hooks/use-kyc-status";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const {
    kycStatus,
    isLoading: kycLoading,
    error: kycError,
  } = useKycStatus({ enabled: ready && authenticated });

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/login");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!ready || !authenticated || kycLoading) return;
    // Fail open — allow access if KYC service is down
    if (kycError) return;
    if (kycStatus !== "ACTIVE") {
      router.replace("/verify");
    }
  }, [ready, authenticated, kycLoading, kycError, kycStatus, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (!ready || (authenticated && kycLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  const kycPassed = kycStatus === "ACTIVE" || kycError;
  if (!authenticated || !kycPassed) return null;

  return (
    <>
      <header className="fixed top-0 right-0 z-50 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg bg-surface/80 px-3 py-2 text-xs text-text-muted border border-glass-border backdrop-blur-sm transition-colors hover:text-text"
          aria-label="Log out"
        >
          <LogOut size={14} />
          <span className="font-body">Logout</span>
        </button>
      </header>
      <main className="pb-[56px]">{children}</main>
      <BottomTabBar />
    </>
  );
}
