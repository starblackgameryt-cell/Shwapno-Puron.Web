import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Baloo_Da_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const balooDa2 = Baloo_Da_2({
  variable: "--font-baloo",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0B3D2E",
};

const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://shwapno-puron-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "স্বপ্ন পূরণ — Shwapno Puron",
    template: "%s | স্বপ্ন পূরণ",
  },
  description:
    "ঐতিহ্যবাহী কারুশিল্পের সাথে আধুনিক ফ্যাশনের মেলবন্ধন। প্রিমিয়াম সালোয়ার কামিজ, শাড়ি ও লেহেঙ্গা।",
  keywords: ["স্বপ্ন পূরণ", "ফ্যাশন", "সালোয়ার কামিজ", "শাড়ি", "লেহেঙ্গা", "বাংলাদেশি ফ্যাশন"],
  authors: [{ name: "স্বপ্ন পূরণ" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "স্বপ্ন পূরণ — Shwapno Puron",
  },
  verification: {
    google: "uh5v58YOgmC_0YBVgHeWcb7nosGizGk3A6qVvMKOIJo",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} ${balooDa2.variable} antialiased bg-background text-foreground overscroll-none`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
