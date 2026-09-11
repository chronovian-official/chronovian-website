import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chronovian.com"),
  title: {
    default: "Chronovian By Ankris Luxurio — Luxury Watches, Jewellery & Bags | Hyderabad",
    template: "%s | Chronovian",
  },
  description:
    "A sanctuary for extraordinary timepieces and fine jewellery. Rolex, Audemars Piguet, Patek Philippe and more — by appointment only in Narsingi, Hyderabad.",
  keywords: [
    "luxury watches Hyderabad",
    "pre-owned Rolex India",
    "fine jewellery Hyderabad",
    "luxury watch boutique Narsingi",
    "Chronovian By Ankris Luxurio",
  ],
  openGraph: {
    title: "Chronovian By Ankris Luxurio",
    description:
      "A sanctuary for extraordinary timepieces and fine jewellery. By appointment only — Narsingi, Hyderabad.",
    url: "https://chronovian.com",
    siteName: "Chronovian By Ankris Luxurio",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chronovian By Ankris Luxurio",
    description:
      "A sanctuary for extraordinary timepieces and fine jewellery. By appointment only — Narsingi, Hyderabad.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
