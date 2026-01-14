import type { Metadata } from 'next'
import GamesClient from './GamesClient'

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return {
    title: `Matchs NBA du Jour - ${today} | STAT-DISCUTE`,
    description: `Programme NBA du ${today} : calendrier complet, scores en direct, cotes et analyses.`,
    keywords: `matchs NBA, calendrier NBA, scores, ${today}`,
    openGraph: {
      title: `Matchs NBA - ${today}`,
      description: 'Calendrier et scores en direct des matchs NBA',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Matchs NBA - ${today}`,
      description: 'Calendrier et scores en direct des matchs NBA',
    }
  }
}

export default function GamesPage() {
  return <GamesClient />
}
