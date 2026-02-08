"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/clubs");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex flex-col items-center text-center">
      <img
        src="/fantera-logo.svg"
        alt="Fantera"
        className="mb-6 h-10 w-auto"
      />
      <div className="mb-8">
        <h1 className="text-4xl font-display text-text tracking-wide">
          Own Your Club
        </h1>
        <p className="mt-3 text-text-secondary font-body">
          Sign in to start building your portfolio
        </p>
      </div>

      <div className="w-full rounded-xl border border-glass-border bg-surface p-6">
        <button
          onClick={login}
          disabled={!ready}
          className="w-full rounded-lg bg-coral px-6 py-3 font-heading font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {ready ? "Sign In" : "Loading..."}
        </button>
        <p className="mt-4 text-xs text-text-muted">
          Sign in with Google, Apple, email, or connect your wallet
        </p>
      </div>
    </div>
  );
}
