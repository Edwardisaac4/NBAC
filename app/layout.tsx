import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PageAnimatePresence } from "@/components/layout/page-animate-presence";
import { ToastProvider } from "@/components/shared/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nbac.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NBAC | Nigerian Business Aviation Conference",
    template: "%s | NBAC",
  },
  description: "West Africa's premier business aviation conference combining elite panels, private aircraft displays, and high-level networking.",
  icons: {
    icon: "/images/logo-mark.jpg",
    shortcut: "/images/logo-mark.jpg",
    apple: "/images/logo-mark.jpg",
  },
  openGraph: {
    title: "NBAC | Nigerian Business Aviation Conference",
    description: "West Africa's premier business aviation conference combining elite panels, private aircraft displays, and high-level networking.",
    url: siteUrl,
    siteName: "Nigerian Business Aviation Conference",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "NBAC - Nigerian Business Aviation Conference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NBAC | Nigerian Business Aviation Conference",
    description: "West Africa's premier business aviation conference combining elite panels, private aircraft displays, and high-level networking.",
    images: ["/images/og-banner.png"],
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
      className={cn(
        "h-full dark",
        "antialiased",
        inter.variable,
        cormorant.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-nbac-canvas text-nbac-text font-sans antialiased">
        <ToastProvider>
          <PageAnimatePresence>
            {children}
          </PageAnimatePresence>
        </ToastProvider>
      </body>
    </html>
  );
}
