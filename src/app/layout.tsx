import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // 전역 CSS 변수로 설정
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins", // 전역 CSS 변수로 설정
});

export const metadata: Metadata = {
  title: "English Listening Practice | Learn with Audio",
  description:
    "Improve your English listening skills with interactive audio lessons",

  manifest: "/manifest.json",
  themeColor: "#000000",

  icons: {
    icon: "/icon-512x512.png",
  },
  // 모바일 최적화 메타 태그
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // 안드로이드 PWA 관련 설정
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
