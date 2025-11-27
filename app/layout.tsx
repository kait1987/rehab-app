import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NotificationPrompt } from "@/components/shared/NotificationPrompt";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { LocationHandler } from "@/components/shared/LocationHandler";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "동네 재활 헬스장",
  description: "동네에서 재활운동하기 좋은 헬스장과 내 몸에 맞는 재활 코스를 한 번에",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "동네 재활 헬스장",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1B1D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#1A1B1D" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
        <LocationHandler />
        <ServiceWorkerRegistration />
        <NotificationPrompt />
      </body>
    </html>
  );
}
