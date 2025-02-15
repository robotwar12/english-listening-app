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
  icons: {
    icon: "/favicon.svg",
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
