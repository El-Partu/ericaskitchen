// 📁 app/layout.tsx

import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/lib/query-provider";
import { CartProvider } from "@/lib/cart-context";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ← add this
import type { Metadata } from "next";
import { Montserrat, Roboto, Geist } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Erica's Kitchen — Delicious Ghanaian Food",
  description:
    "Bringing the heart of Ghanaian flavor to your table, one plate at a time. Order Banku, Jollof Rice, Fufu and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <QueryProvider>
            <AuthProvider>
              <CartProvider>{children}</CartProvider>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-roboto), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
