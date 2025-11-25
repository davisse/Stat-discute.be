import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "STAT-DISCUTE - NBA Statistics & Betting Analytics",
  description: "L'outil #1 des parieurs NBA - Statistiques complètes, analyses avancées et cotes en temps réel pour la saison 2025-26",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "STAT-DISCUTE - NBA Statistics & Betting Analytics",
    description: "L'outil #1 des parieurs NBA",
    type: 'website',
    siteName: 'STAT-DISCUTE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
