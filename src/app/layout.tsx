import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './context/theme-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * SEO Metadata
 * Update these values with your actual information
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Ven.dev',
    template: '%s | Creative.Dev',
  },
  description: 'Professional portfolio showcasing expertise in video editing, photography, and modern web development. Crafting compelling narratives through digital experiences.',
  keywords: ['video editing', 'photography', 'web development', 'next.js', 'portfolio', 'creative'],
  authors: [{ name: 'Creative.Dev' }],
  creator: 'Creative.Dev',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Creative.Dev Portfolio',
    title: 'Creative.Dev | Video, Photo & Web Development Portfolio',
    description: 'Professional portfolio showcasing expertise in video editing, photography, and modern web development.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Creative.Dev Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creative.Dev | Video, Photo & Web Development Portfolio',
    description: 'Professional portfolio showcasing expertise in video editing, photography, and modern web development.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification here
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a14] dark:bg-[#0a0a14] light:bg-[#f8f9fa] text-white dark:text-white light:text-gray-900`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

