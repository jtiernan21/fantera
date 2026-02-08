import type { Metadata } from "next";
import { Sora, DM_Sans, Bebas_Neue } from "next/font/google";
import PrivyClientProvider from "@/components/providers/PrivyClientProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "600"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas-neue",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Fantera",
  description: "Own shares in the clubs you love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${bebasNeue.variable} dark antialiased`}
    >
      <body className="bg-base text-text font-body">
        <PrivyClientProvider>
          <QueryProvider>{children}</QueryProvider>
        </PrivyClientProvider>
      </body>
    </html>
  );
}
