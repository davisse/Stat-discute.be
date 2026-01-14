import { MetadataRoute } from 'next'
import { query } from '@/lib/db'

const BASE_URL = 'https://stats.defendini.be'

async function getCurrentSeason(): Promise<string> {
  const result = await query(
    'SELECT season_id FROM seasons WHERE is_current = true LIMIT 1'
  )
  return result.rows[0]?.season_id || '2025-26'
}

async function getTeams() {
  const result = await query(
    'SELECT team_id FROM teams ORDER BY abbreviation'
  )
  return result.rows.map(row => row.team_id)
}

async function getRecentGames(limit: number = 100) {
  const season = await getCurrentSeason()
  const result = await query(
    `SELECT game_id FROM games
     WHERE season = $1
     ORDER BY game_date DESC
     LIMIT $2`,
    [season, limit]
  )
  return result.rows.map(row => row.game_id)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [teams, recentGames] = await Promise.all([
      getTeams(),
      getRecentGames()
    ])

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/teams`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/players`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/games`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/betting/totals`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/betting/value-finder`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/player-props`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ]

    const teamRoutes: MetadataRoute.Sitemap = teams.map(teamId => ({
      url: `${BASE_URL}/teams/${teamId}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    const gameRoutes: MetadataRoute.Sitemap = recentGames.map(gameId => ({
      url: `${BASE_URL}/games/${gameId}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...teamRoutes, ...gameRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // Fallback minimal
    return [{
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1.0,
    }]
  }
}
