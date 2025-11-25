/**
 * Mobile-First Landing Page
 * Optimized for thumb navigation with bottom nav bar
 */

import Image from 'next/image'
import Link from 'next/link'
import BurgerMenu from '@/components/mobile/BurgerMenu'

export default function MobileLanding() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Burger Menu */}
      <BurgerMenu />

      {/* Main Content Area - scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-8">
          {/* Dotted Background Pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />

          {/* Logo */}
          <div className="relative z-10 mb-12">
            <Image
              src="/logo-v5.png"
              alt="Stat Discute"
              width={256}
              height={64}
              priority
              className="w-64 h-auto"
            />
          </div>

          {/* Navigation Pills - Horizontal Scroll */}
          <div className="relative z-10 w-full mb-16 overflow-x-auto">
            <div className="flex gap-3 px-6 pb-4 min-w-max">
              <NavPill href="#lineups" label="Lineups" />
              <NavPill href="#defense" label="Défense" />
              <NavPill href="#paris" label="Paris" />
              <NavPill href="#props" label="Props" />
              <NavPill href="#agent" label="Agent" />
              <NavPill href="#matchups" label="Matchups" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="relative z-10 text-4xl sm:text-5xl font-bold text-center mb-6 leading-tight">
            Prenez le contrôle de vos paris NBA
          </h1>

          {/* Subtitle */}
          <p className="relative z-10 text-lg sm:text-xl text-gray-300 text-center mb-12 max-w-2xl leading-relaxed">
            Statistiques avancées, analyses en temps réel, et prédictions basées
            sur les données pour transformer vos paris en décisions éclairées.
          </p>

          {/* CTA Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full max-w-md mb-16">
            <Link
              href="/signup"
              className="flex-1 bg-white text-black font-semibold py-4 px-8 rounded-2xl text-center text-lg hover:bg-gray-100 transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="flex-1 bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl text-center text-lg hover:bg-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>

          {/* Stats Section */}
          <div className="relative z-10 grid grid-cols-3 gap-6 w-full max-w-2xl">
            <StatCard number="212" label="MATCHS ANALYSÉS" />
            <StatCard number="479" label="JOUEURS TRACKÉS" />
            <StatCard number="4750" label="BOX SCORES" />
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 space-y-12">
          <FeatureCard
            title="Analyses en temps réel"
            description="Suivez les performances en direct avec nos statistiques avancées"
            icon="📊"
          />
          <FeatureCard
            title="Prédictions basées sur les données"
            description="Algorithmes avancés pour des paris plus éclairés"
            icon="🎯"
          />
          <FeatureCard
            title="Suivi des joueurs"
            description="Statistiques détaillées et tendances pour chaque joueur NBA"
            icon="🏀"
          />
        </section>
      </main>

      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-3 px-4 max-w-screen-xl mx-auto">
          <NavButton icon="🏠" label="Accueil" active />
          <NavButton icon="📊" label="Stats" />
          <NavButton icon="🎯" label="Paris" />
          <NavButton icon="👤" label="Profil" />
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
      className="px-6 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors whitespace-nowrap"
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

// Feature Card Component
function FeatureCard({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon: string
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

// Bottom Navigation Button
function NavButton({
  icon,
  label,
  active = false
}: {
  icon: string;
  label: string;
  active?: boolean
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
        active
          ? 'text-white bg-white/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
