import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
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

const siteUrl = "https://nbac.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL('https://nbac.com.ng'),

  title: {
    default:  'Nigerian Business Aviation Conference 2027',
    template: '%s — NBAC 2027',
  },

  description:
    "West Africa's premier business aviation conference. " +
    "4–5 May 2027, Lagos, Nigeria. Bringing together operators, " +
    "regulators, financiers, and innovators shaping the future " +
    "of Nigerian aviation.",

  icons: {
    icon: "/images/logo-mark.jpg",
    shortcut: "/images/logo-mark.jpg",
    apple: "/images/logo-mark.jpg",
  },

  keywords: [
    'Nigerian Business Aviation Conference',
    'NBAC 2027',
    'business aviation Nigeria',
    'West Africa aviation conference',
    'aviation conference Lagos',
    'private aviation Nigeria',
    'business aviation West Africa',
    'aviation conference 2027',
    'Nigerian aviation events',
    'business jet Nigeria',
  ],

  authors:   [{ name: 'Nigerian Business Aviation Conference' }],
  creator:   'NBAC',
  publisher: 'Nigerian Business Aviation Conference',

  openGraph: {
    type:      'website',
    locale:    'en_NG',
    url:       'https://nbac.com.ng',
    siteName:  'NBAC 2027',
    title:     'Nigerian Business Aviation Conference 2027',
    description:
      "West Africa's premier business aviation conference. " +
      "4–5 May 2027, Lagos, Nigeria.",
    images: [{
      url:    '/og/default.jpg',
      width:  1200,
      height: 630,
      alt:    'NBAC 2027 — Nigerian Business Aviation Conference',
    }],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Nigerian Business Aviation Conference 2027',
    description: "West Africa's premier business aviation conference. 4–5 May 2027, Lagos.",
    images:      ['/og/default.jpg'],
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  alternates: {
    canonical: 'https://nbac.com.ng',
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
            {children}
        </ToastProvider>
      </body>
    </html>
  );
}
