import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { CartProvider } from "@/components/cart/cart-context";
import { WishlistProvider } from "@/components/wishlist/wishlist-context";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeInitScript } from "@/components/theme-init";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingContactButtons } from "@/components/floating-contact-buttons";
import { CustomerFacingOnly } from "@/components/customer-facing-only";
import { isAdminUser } from "@/lib/admin";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Gatumi's Trends Imports",
  description: "Curated imports — cosmetics, fashion, home, and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const isAdmin = isAdminUser(user);

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#d4a017",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          colorBackground: "#151e32",
          colorInputBackground: "#1c2844",
          colorNeutral: "#475569",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <head>
          <ThemeInitScript />
        </head>
        <body className="min-h-dvh flex flex-col overflow-x-hidden bg-background text-foreground">
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <AppHeader isAdmin={isAdmin} />
                <main className="min-w-0 flex-1 bg-background text-foreground">{children}</main>
                <SiteFooter />
                <CustomerFacingOnly>
                  <FloatingContactButtons />
                </CustomerFacingOnly>
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
