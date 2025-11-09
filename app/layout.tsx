import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChannelGrowth - AI-Powered Telegram Channel Management",
  description: "Grow your Telegram channel revenue by 30% with AI-powered analytics and recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const manifestUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tonconnect-manifest.json`
    : 'https://channelgrowth-saas.vercel.app/tonconnect-manifest.json';

  return (
    <html lang="en">
      <body className={inter.variable}>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
