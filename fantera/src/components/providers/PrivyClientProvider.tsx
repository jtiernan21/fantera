"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

  if (!appId || !clientId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#F46D5B",
          logo: "/fantera-logo.svg",
        },
        walletConnectCloudProjectId:
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        loginMethods: ["email", "google", "apple", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
