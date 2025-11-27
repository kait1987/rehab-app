import type { Metadata } from "next";
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
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "동네 재활 헬스장",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <LocationHandler />
        <ServiceWorkerRegistration />
        <NotificationPrompt />
      </body>
    </html>
  );
}
