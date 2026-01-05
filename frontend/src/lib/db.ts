import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nba_stats',
  user: process.env.DB_USER || 'chapirou',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start

  if (process.env.NODE_ENV === 'development' && duration > 100) {
    console.log('Slow query:', { text: text.substring(0, 100), duration, rows: result.rowCount })
  }

  return result
}

export async function getClient() {
  const client = await pool.connect()
  return client
}

export async function getCurrentSeason(): Promise<string> {
  const result = await query<{ season_id: string }>(
    'SELECT season_id FROM seasons WHERE is_current = true LIMIT 1'
  )
  return result.rows[0]?.season_id || '2025-26'
}

export default pool
