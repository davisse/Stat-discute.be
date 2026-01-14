// ============================================================================
// Homepage - Server Component with SEO Metadata
// ============================================================================
// PAS de 'use client' - Server Component par défaut

import type { Metadata } from 'next'
import {
  FixedNav,
  HeroSection,
  NavigationGrid,
  FooterSection,
} from '@/components/home'

export const metadata: Metadata = {
  title: 'STAT-DISCUTE - Analyse NBA Data-Driven | Statistiques & Betting 2025-26',
  description: 'Plateforme d\'analyse NBA : statistiques avancées, DvP analysis, props finder et intelligence betting pour la saison 2025-26.',
  keywords: ['NBA', 'statistiques', 'betting', 'analytics', 'saison 2025-26', 'paris sportifs', 'analyse données', 'props joueurs', 'totaux O/U'],
  openGraph: {
    title: 'STAT-DISCUTE - Analyse NBA Data-Driven',
    description: 'Statistiques NBA avancées et intelligence betting pour la saison 2025-26',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'STAT-DISCUTE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAT-DISCUTE - Analyse NBA Data-Driven',
    description: 'Statistiques NBA avancées et intelligence betting',
  }
}

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen">
      {/* H1 sémantique - visually hidden for SEO */}
      <h1 className="sr-only">
        STAT-DISCUTE - Analyse NBA Data-Driven : Statistiques, Betting et Props 2025-26
      </h1>

      {/* Fixed Navigation */}
      <FixedNav />

      {/* Hero Section */}
      <HeroSection />

      {/* Navigation Grid */}
      <NavigationGrid />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
