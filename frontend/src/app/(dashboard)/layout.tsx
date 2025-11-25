'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, Shield, DollarSign, TrendingUp, Activity, Settings, Home } from 'lucide-react'
import { BackToTop } from '@/components/ui/back-to-top'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/landing',
      label: 'Accueil',
      icon: Home,
    },
    {
      href: '/players',
      label: 'Joueurs',
      icon: Users,
    },
    {
      href: '/teams',
      label: 'Équipes',
      icon: Shield,
    },
    {
      href: '/betting',
      label: 'Paris',
      icon: DollarSign,
    },
    {
      href: '/player-props',
      label: 'Props Joueurs',
      icon: TrendingUp,
    },
    {
      href: '/betting/odds-tracker',
      label: 'Tracker Cotes',
      icon: Activity,
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#000000'}}>
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{backgroundColor: '#000000', borderBottom: '1px solid #333333'}}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative h-12 w-44">
                <Image
                  src="/logo-v5.png"
                  alt="STAT-DISCUTE"
                  fill
                  sizes="(max-width: 768px) 140px, 176px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex-shrink-0",
                      isActive
                        ? "text-white shadow-md"
                        : "text-gray-300 hover:text-white"
                    )}
                    style={isActive ? {
                      backgroundColor: '#FFFFFF',
                      color: '#000000'
                    } : {
                      backgroundColor: 'transparent',
                      color: '#ADADAD'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ADADAD';
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <BackToTop />
    </div>
  )
}