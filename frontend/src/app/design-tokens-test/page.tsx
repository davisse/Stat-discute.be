'use client'

import { AppLayout } from '@/components/layout'
import { colors, spacing, radius, shadows, typography } from '@/lib/design-tokens'

/**
 * Page de test pour visualiser les Design Tokens Phase 1
 * Accessible à : http://localhost:3000/design-tokens-test
 */
export default function DesignTokensTestPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-16 p-12">

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">STAT-DISCUTE Design System</h1>
          <p className="text-gray-400 text-lg">Phase 1 : Design Tokens - Tests Visuels</p>
        </header>

        {/* Couleurs de Base */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Couleurs de Base</h2>

          <div className="grid grid-cols-8 gap-4">
            {Object.entries(colors.gray).map(([level, color]) => (
              <div key={level} className="space-y-2">
                <div
                  className="h-20 rounded-lg border border-gray-700"
                  style={{ backgroundColor: color }}
                />
                <div className="text-xs text-gray-400">
                  <div className="font-mono">gray-{level}</div>
                  <div className="font-mono">{color}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Couleurs Fonctionnelles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Couleurs Fonctionnelles</h2>
          <p className="text-sm text-gray-500">⚠️ Utilisées UNIQUEMENT pour les données, JAMAIS pour l'UI</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div
                className="h-20 rounded-lg"
                style={{ backgroundColor: colors.positive }}
              />
              <div className="text-xs text-gray-400">
                <div className="font-semibold">Positive</div>
                <div className="font-mono">{colors.positive}</div>
                <div className="text-gray-500">Win, Over, Gains</div>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="h-20 rounded-lg"
                style={{ backgroundColor: colors.negative }}
              />
              <div className="text-xs text-gray-400">
                <div className="font-semibold">Negative</div>
                <div className="font-mono">{colors.negative}</div>
                <div className="text-gray-500">Loss, Under, Pertes</div>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="h-20 rounded-lg"
                style={{ backgroundColor: colors.neutral }}
              />
              <div className="text-xs text-gray-400">
                <div className="font-semibold">Neutral</div>
                <div className="font-mono">{colors.neutral}</div>
                <div className="text-gray-500">Push, Neutre</div>
              </div>
            </div>
          </div>
        </section>

        {/* Typographie */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Typographie</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Inter (UI) vs JetBrains Mono (Data)</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-4xl font-bold">STAT-DISCUTE</div>
                  <div className="text-sm text-gray-400">Font: Inter (sans-serif)</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-mono font-bold">28.5 PPG</div>
                  <div className="text-sm text-gray-400">Font: JetBrains Mono (monospace)</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-3">
              {Object.entries(typography.fontSize).map(([size, value]) => (
                <div key={size} className="flex items-center gap-4">
                  <div
                    className="font-semibold"
                    style={{ fontSize: value }}
                  >
                    Sample Text
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {size} ({value})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Espacement */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Espacement (Système 8px)</h2>

          <div className="space-y-3">
            {Object.entries(spacing).map(([level, value]) => (
              <div key={level} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-400 font-mono">
                  space-{level}
                </div>
                <div
                  className="bg-white h-8"
                  style={{ width: value }}
                />
                <div className="text-xs text-gray-500 font-mono">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Border Radius</h2>

          <div className="grid grid-cols-6 gap-4">
            {Object.entries(radius).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <div
                  className="h-20 bg-gray-850 border border-gray-700"
                  style={{ borderRadius: value }}
                />
                <div className="text-xs text-gray-400">
                  <div className="font-mono">radius-{size}</div>
                  <div className="font-mono text-gray-500">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows (Glows) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Shadows (Glows pour fond noir)</h2>

          <div className="grid grid-cols-4 gap-6">
            {Object.entries(shadows).map(([size, value]) => (
              <div key={size} className="space-y-4">
                <div
                  className="h-32 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-center"
                  style={{ boxShadow: value }}
                >
                  <span className="text-sm text-gray-400">Hover Effect</span>
                </div>
                <div className="text-xs text-gray-400">
                  <div className="font-mono">shadow-{size}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Composants Exemple */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4">Composants Exemple</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Card Exemple */}
            <div className="bg-gray-850 border border-gray-800 rounded-lg p-6 space-y-4 transition-all duration-300 hover:border-white hover:shadow-md hover:-translate-y-1">
              <h3 className="text-xl font-semibold">Stat Card</h3>
              <div className="text-4xl font-mono font-bold">28.5</div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: colors.positive }}>↑ +5.2%</span>
                <span className="text-xs text-gray-500">vs moyenne</span>
              </div>
            </div>

            {/* Button Exemple */}
            <div className="space-y-4">
              <button className="w-full bg-white text-black px-6 py-3 rounded-md font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-md">
                Primary Button
              </button>

              <button className="w-full bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium transition-all duration-300 hover:bg-white hover:text-black">
                Secondary Button
              </button>

              <button className="w-full bg-transparent text-gray-400 px-6 py-3 rounded-md font-medium transition-all duration-300 hover:text-white hover:bg-gray-900">
                Ghost Button
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
          <p>Design System v1.0 - Phase 1 : Design Tokens</p>
          <p className="text-xs text-gray-600 mt-2">
            Tous les tokens sont disponibles en CSS variables et TypeScript
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}
