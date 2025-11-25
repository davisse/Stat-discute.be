/**
 * Homepage - Mobile-First Landing Page
 * Optimized for thumb navigation with bottom nav bar and burger menu
 */

import Image from 'next/image'
import Link from 'next/link'
import BurgerMenu from '@/components/mobile/BurgerMenu'
import {
  AnimatedCounter,
  MiniSparkline,
  RadarChart,
  ComparisonCard,
  HorizontalScrollCards,
  LiveTicker
} from '@/components/landing'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Dotted Background Pattern - Full Screen */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          zIndex: 0
        }}
      />

      {/* Fixed Header with Logo - High z-index to stay above menu backdrop */}
      <header className="fixed top-0 left-0 right-0 z-[58] bg-black">
        <div className="flex justify-center pt-6 pb-4">
          <Link href="/" className="block transition-opacity duration-300 hover:opacity-80">
            <Image
              src="/logo-v5.png"
              alt="Stat Discute"
              width={256}
              height={64}
              priority
              className="w-64 h-auto"
            />
          </Link>
        </div>
      </header>

      {/* Burger Menu */}
      <BurgerMenu />

      {/* Main Content Area - scrollable with top padding for fixed header */}
      <main className="flex-1 overflow-y-auto pb-20 pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6">

          {/* Main Headline */}
          <h1 className="relative z-10 text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight max-w-xl">
            Les Données NBA Qui Font Gagner Vos Paris
          </h1>

          {/* Subheadline */}
          <p className="relative z-10 text-base sm:text-lg text-gray-400 text-center mb-12 max-w-md">
            Stats pro • Analytics avancées • Paris intelligents
          </p>

          {/* Animated Stats Counters */}
          <div className="relative z-10 grid grid-cols-3 gap-6 sm:gap-8 w-full max-w-2xl mb-12">
            <AnimatedCounter end={212} label="Matchs" duration={2000} />
            <AnimatedCounter end={479} label="Joueurs" duration={2000} />
            <AnimatedCounter end={4750} label="Box Scores" duration={2000} />
          </div>

          {/* CTA Button */}
          <div className="relative z-10 flex justify-center w-full max-w-md mb-12">
            <Link
              href="/login"
              className="bg-white text-black font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm flex items-center justify-center"
            >
              Se connecter
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="relative z-10 flex flex-col items-center animate-bounce">
            <div className="text-gray-500 text-sm mb-2">Découvrir</div>
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="relative px-6 py-16 min-h-[50vh] flex flex-col items-center justify-center">
          <h2 className="relative z-10 text-3xl sm:text-4xl font-bold text-center mb-12">
            Pourquoi Stat Discute?
          </h2>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Problem Card */}
            <ComparisonCard
              icon="❌"
              title="Paris sans données?"
              percentage={10}
              color="rgb(239, 68, 68)"
              label="Taux de réussite"
            />

            {/* Solution Card */}
            <ComparisonCard
              icon="✅"
              title="Analytics qui gagnent"
              percentage={78}
              color="rgb(34, 197, 94)"
              label="Taux de réussite"
            />
          </div>
        </section>

        {/* Navigation Pills - After Hero */}
        <section className="relative px-6 mb-12">
          <div className="relative z-10 w-full overflow-x-auto">
            <div className="flex gap-3 pb-4 min-w-max">
              <NavPill href="/lineups" label="Lineups" />
              <NavPill href="/team-defense" label="Défense" />
              <NavPill href="/betting" label="Paris" />
              <NavPill href="/player-props" label="Props" />
              <NavPill href="/betting/value-finder" label="Agent" />
              <NavPill href="/matchups" label="Matchups" />
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced with Visualizations */}
        <section className="px-6 py-16 space-y-8">
          <h2 className="relative z-10 text-3xl sm:text-4xl font-bold text-center mb-12">
            Plateforme Complète
          </h2>

          {/* Feature: Real-time Analytics */}
          <EnhancedFeatureCard
            icon="📊"
            title="Analyses en temps réel"
            description="Suivez les performances en direct avec nos statistiques avancées"
          >
            <MiniSparkline
              data={[45, 52, 48, 65, 70, 68, 75, 82, 78, 85]}
              width={200}
              height={60}
              color="rgb(34, 197, 94)"
            />
          </EnhancedFeatureCard>

          {/* Feature: Data-driven Predictions */}
          <EnhancedFeatureCard
            icon="🎯"
            title="Prédictions basées sur les données"
            description="Algorithmes avancés pour des paris plus éclairés"
          >
            <div className="flex gap-8 items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 font-mono">78%</div>
                <div className="text-xs text-gray-400 mt-1">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 font-mono">+24%</div>
                <div className="text-xs text-gray-400 mt-1">ROI Moyen</div>
              </div>
            </div>
          </EnhancedFeatureCard>

          {/* Feature: Player Tracking */}
          <EnhancedFeatureCard
            icon="🏀"
            title="Suivi des joueurs"
            description="Statistiques détaillées et tendances pour chaque joueur NBA"
          >
            <RadarChart
              data={[85, 72, 90, 68, 78]}
              labels={['PTS', 'REB', 'AST', 'DEF', 'EFF']}
              size={180}
              color="rgb(59, 130, 246)"
            />
          </EnhancedFeatureCard>
        </section>

        {/* Tools Carousel Section */}
        <HorizontalScrollCards
          title="Outils d'Analyse"
          cards={[
            {
              icon: '📈',
              title: 'Lineups Optimizer',
              description: 'Analysez les compositions d\'équipes et leur impact sur les performances',
              metric: '+15%',
              metricLabel: 'Précision des prévisions'
            },
            {
              icon: '🛡️',
              title: 'Team Defense',
              description: 'Évaluez les capacités défensives avec des métriques avancées',
              metric: '92%',
              metricLabel: 'Fiabilité'
            },
            {
              icon: '🎯',
              title: 'Value Finder',
              description: 'Détectez les opportunités de paris à forte valeur ajoutée',
              metric: '+24%',
              metricLabel: 'ROI Moyen'
            },
            {
              icon: '⚔️',
              title: 'Matchup Analysis',
              description: 'Comparez les confrontations historiques et tendances',
              metric: '85%',
              metricLabel: 'Précision'
            },
            {
              icon: '👤',
              title: 'Player Props',
              description: 'Prédictions individuelles basées sur les stats avancées',
              metric: '78%',
              metricLabel: 'Taux de réussite'
            }
          ]}
        />

        {/* Live Ticker Section */}
        <LiveTicker
          items={[
            { id: '1', icon: '🔥', text: 'Lakers vs Celtics - O 225.5 ✅', highlight: true },
            { id: '2', text: 'Warriors -5.5 vs Suns' },
            { id: '3', icon: '📊', text: 'LeBron James O 25.5 pts' },
            { id: '4', text: 'Bucks vs Heat - U 218.5' },
            { id: '5', icon: '⚡', text: 'Stephen Curry O 4.5 3PT ✅', highlight: true },
            { id: '6', text: 'Nuggets -3 vs Clippers' }
          ]}
          speed={40}
        />

        {/* Social Proof Section */}
        <section className="px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Résultats Prouvés
          </h2>

          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
              <div className="text-4xl font-bold text-green-500 mb-2 font-mono">+24%</div>
              <div className="text-sm text-gray-400">ROI Moyen</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
              <div className="text-4xl font-bold text-blue-500 mb-2 font-mono">78%</div>
              <div className="text-sm text-gray-400">Précision</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
              <div className="text-4xl font-bold text-purple-500 mb-2 font-mono">1,200+</div>
              <div className="text-sm text-gray-400">Utilisateurs Actifs</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
              <div className="text-4xl font-bold text-orange-500 mb-2 font-mono">4.8/5</div>
              <div className="text-sm text-gray-400">Note Moyenne</div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-16 bg-white/5">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Comment Ça Marche?
          </h2>

          <div className="max-w-2xl mx-auto space-y-8">
            <ProcessStep
              number={1}
              title="Collecte des Données"
              description="Agrégation automatique des stats NBA officielles en temps réel"
              icon="📊"
            />
            <ProcessStep
              number={2}
              title="Analyse Avancée"
              description="Algorithmes d'apprentissage pour identifier les tendances et patterns"
              icon="🧠"
            />
            <ProcessStep
              number={3}
              title="Recommandations"
              description="Alertes personnalisées et opportunités de paris à haute valeur"
              icon="🎯"
            />
            <ProcessStep
              number={4}
              title="Suivi des Résultats"
              description="Tableau de bord pour suivre vos performances et ajuster votre stratégie"
              icon="📈"
            />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à Optimiser Vos Paris?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Rejoignez des centaines de parieurs qui utilisent nos analytics pour gagner plus
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-white text-black font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm"
          >
            Commencer Maintenant
          </Link>
        </section>
      </main>

      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-3 px-4 max-w-screen-xl mx-auto">
          <NavButton icon="🏠" label="Accueil" href="/" active />
          <NavButton icon="📊" label="Stats" href="/players" />
          <NavButton icon="🎯" label="Paris" href="/betting" />
          <NavButton icon="👤" label="Profil" href="/admin" />
        </div>
      </nav>
    </div>
  )
}

// Navigation Pill Component (Horizontal Scroll)
function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-6 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-200 whitespace-nowrap hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm"
    >
      {label}
    </a>
  )
}

// Stat Card Component
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold mb-2">{number}</div>
      <div className="text-xs sm:text-sm text-gray-400 font-medium leading-tight">
        {label}
      </div>
    </div>
  )
}

// Enhanced Feature Card Component with Visualization Support
function EnhancedFeatureCard({
  title,
  description,
  icon,
  children
}: {
  title: string
  description: string
  icon: string
  children?: React.ReactNode
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm cursor-pointer">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-6">{description}</p>

      {/* Embedded Visualization */}
      {children && (
        <div className="flex items-center justify-center mt-6 pt-6 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  )
}

// Process Step Component
function ProcessStep({
  number,
  title,
  description,
  icon
}: {
  number: number
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="flex gap-4 items-start">
      {/* Number Circle */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
        {number}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// Bottom Navigation Button
function NavButton({
  icon,
  label,
  href,
  active = false
}: {
  icon: string
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm ${
        active
          ? 'text-white bg-white/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

