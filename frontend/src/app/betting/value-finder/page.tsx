import { AppLayout } from '@/components/layout'
import { getBettingValueRecommendations } from '@/lib/queries'
import { GameCard } from './GameCard'
import { PerformanceMetrics } from './PerformanceMetrics'

export const dynamic = 'force-dynamic'

export default async function ValueFinderPage() {
  const recommendations = await getBettingValueRecommendations(7, 0) // Last 7 days

  return (
    <AppLayout>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Betting Value Finder
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '24px'
          }}>
            Multi-factor analysis identifying high-value betting opportunities
          </p>

          {/* Performance Metrics */}
          <PerformanceMetrics recommendations={recommendations} />
        </div>

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <div style={{
            padding: '64px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '20px', color: 'white', marginBottom: '8px' }}>
              No Analysis Available
            </div>
            <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Run the betting value analysis script to generate recommendations
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
            gap: '24px'
          }}>
            {recommendations.map((rec) => (
              <GameCard key={rec.analysis_id} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
