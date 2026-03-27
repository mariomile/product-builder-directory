import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { ConsoleGreeting } from "@/components/console-greeting";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Product Builder Directory",
  description:
    "Cut through the noise. Only the best resources on Product Building, hand-picked and curated by experts.",
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
        <CommandPalette />
        <ConsoleGreeting />
      </body>
    </html>
  );
}
