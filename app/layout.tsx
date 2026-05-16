import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "BYASHARA STORE — Electronics Wholesale Marketplace",
    template: "%s | BYASHARA STORE",
  },
  description:
    "Rwanda & Eastern DRC's #1 wholesale electronics marketplace. Bulk smartphones, laptops, accessories and more. Order via WhatsApp instantly.",
  keywords: ["electronics wholesale", "Rwanda", "DRC", "bulk electronics", "smartphones", "laptops"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "BYASHARA STORE",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
