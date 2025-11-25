'use client'

import * as React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Landing Page - STAT-DISCUTE NBA Statistics Platform
 *
 * Design System Compliance:
 * - Monochrome strict: Only black/white/gray (NO colors)
 * - Background: Black with 15% white dots (provided by AppLayout)
 * - Typography: Inter for UI, JetBrains Mono for numbers
 * - Spacing: 8px system (design tokens)
 * - Anti-impulsivity: Generous spacing, encourage reflection
 * - WCAG 2.1 AA minimum accessibility
 */

// Simple SVG icons (monochrome strict)
const ChartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 3v18h18M7 16l4-4 3 3 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const AnalyticsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="3" y="8" width="4" height="13" fill="currentColor" opacity="0.6" />
    <rect x="10" y="4" width="4" height="17" fill="currentColor" />
    <rect x="17" y="11" width="4" height="10" fill="currentColor" opacity="0.6" />
  </svg>
)

const BrainIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 3C8.5 3 6 5.5 6 9c0 1.5.5 2.9 1.4 4C6.5 13.9 6 15 6 16.5c0 3 2.5 4.5 6 4.5s6-1.5 6-4.5c0-1.5-.5-2.6-1.4-3.5.9-1.1 1.4-2.5 1.4-4 0-3.5-2.5-6-6-6z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
  </svg>
)

export default function LandingPage() {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Fade-in animation on mount
    setIsVisible(true)
  }, [])

  return (
    <AppLayout>
      {/* Hero Section - Full viewport height */}
      <section
        className="flex flex-col items-center justify-center min-h-[calc(100vh-11rem)] px-[var(--space-6)] transition-opacity duration-1000"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-[var(--space-8)]">
          {/* Hero Headline */}
          <h1
            className="text-[var(--text-4xl)] md:text-[3.5rem] lg:text-[4rem] font-[var(--font-bold)] leading-[var(--leading-tight)] text-white"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Prenez le contrôle de vos paris NBA
          </h1>

          {/* Hero Subheadline */}
          <p
            className="text-[var(--text-lg)] md:text-[var(--text-xl)] text-[var(--color-gray-400)] max-w-3xl mx-auto leading-[var(--leading-relaxed)]"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Statistiques avancées, analyses en temps réel, et prédictions basées sur les données
            pour transformer vos paris en décisions éclairées.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-[var(--space-4)] justify-center items-center pt-[var(--space-6)]">
            <Link href="/signup">
              <Button variant="primary" size="xl">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="xl">
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Animated Stats Counter */}
          <div className="pt-[var(--space-16)] grid grid-cols-3 gap-[var(--space-6)] max-w-3xl mx-auto">
            <StatCounter value="212" label="Matchs analysés" />
            <StatCounter value="479" label="Joueurs trackés" />
            <StatCounter value="4750" label="Box scores" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-[var(--space-24)] px-[var(--space-6)]">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-[var(--space-16)]">
            <h2
              className="text-[var(--text-3xl)] md:text-[var(--text-4xl)] font-[var(--font-bold)] text-white mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-family-sans)' }}
            >
              Tout ce dont vous avez besoin
            </h2>
            <p
              className="text-[var(--text-lg)] text-[var(--color-gray-400)] max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-family-sans)' }}
            >
              Une plateforme complète pour analyser, prédire et optimiser vos paris NBA
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-8)]">
            <FeatureCard
              icon={<ChartIcon />}
              title="Statistiques en temps réel"
              description="Accédez aux données NBA en direct : box scores, performances des joueurs, et statistiques d'équipes mises à jour après chaque match."
            />
            <FeatureCard
              icon={<AnalyticsIcon />}
              title="Analyses avancées"
              description="Explorez les Four Factors de Dean Oliver, eFG%, TS%, et toutes les métriques avancées qui comptent vraiment pour vos paris."
            />
            <FeatureCard
              icon={<BrainIcon />}
              title="Prédictions intelligentes"
              description="Bénéficiez de prédictions basées sur des modèles ML entraînés sur des milliers de matchs et performances historiques."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-5xl mx-auto">
          <Card variant="anthracite" padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-8)] text-center">
              <ProofMetric value="2025-26" label="Saison actuelle" />
              <ProofMetric value="30" label="Équipes NBA trackées" />
              <ProofMetric value="24/7" label="Disponibilité" />
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-[var(--space-24)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto text-center space-y-[var(--space-8)]">
          <h2
            className="text-[var(--text-3xl)] md:text-[var(--text-4xl)] font-[var(--font-bold)] text-white"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Prêt à transformer vos paris NBA ?
          </h2>
          <p
            className="text-[var(--text-lg)] text-[var(--color-gray-400)]"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Rejoignez la plateforme d'analyse NBA qui vous donne l'avantage statistique
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)]">
            <Link href="/signup">
              <Button variant="primary" size="xl">
                Créer un compte gratuit
              </Button>
            </Link>
            <p
              className="text-[var(--text-sm)] text-[var(--color-gray-500)]"
              style={{ fontFamily: 'var(--font-family-sans)' }}
            >
              Déjà membre ?{' '}
              <Link
                href="/login"
                className="text-white hover:text-[var(--color-gray-400)] transition-colors duration-[var(--transition-fast)] underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-[var(--space-16)]" aria-hidden="true" />
    </AppLayout>
  )
}

/**
 * StatCounter Component
 * Displays an animated numeric stat with label
 * Uses JetBrains Mono for numbers (data-focused)
 */
interface StatCounterProps {
  value: string
  label: string
}

function StatCounter({ value, label }: StatCounterProps) {
  return (
    <div className="space-y-[var(--space-2)]">
      <div
        className="text-[var(--text-3xl)] md:text-[var(--text-4xl)] font-[var(--font-bold)] text-white"
        style={{ fontFamily: 'var(--font-family-mono)' }}
        aria-label={`${value} ${label}`}
      >
        {value}
      </div>
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-500)] uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {label}
      </div>
    </div>
  )
}

/**
 * FeatureCard Component
 * Card component for feature showcase with icon
 */
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card
      variant="anthracite"
      padding="lg"
      className="hover:border-white hover:shadow-[var(--shadow-lg)] hover:-translate-y-[2px] transition-all duration-[var(--transition-normal)]"
    >
      <CardHeader>
        <div className="mb-[var(--space-4)] text-white" aria-hidden="true">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-[var(--text-base)] leading-[var(--leading-relaxed)]">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

/**
 * ProofMetric Component
 * Social proof metric display
 */
interface ProofMetricProps {
  value: string
  label: string
}

function ProofMetric({ value, label }: ProofMetricProps) {
  return (
    <div className="space-y-[var(--space-2)]">
      <div
        className="text-[var(--text-3xl)] font-[var(--font-bold)] text-white"
        style={{ fontFamily: 'var(--font-family-mono)' }}
        aria-label={`${value} ${label}`}
      >
        {value}
      </div>
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-400)]"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {label}
      </div>
    </div>
  )
}
