import { spawn } from 'child_process'
import { NextResponse } from 'next/server'
import { insertSyncLog } from '@/lib/queries'

export async function POST(): Promise<NextResponse> {
  const startTime = Date.now()

  return new Promise<NextResponse>((resolve) => {
    const python = spawn('python3', [
      '/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/sync_season_2025_26.py'
    ])

    let output = ''
    let error = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      error += data.toString()
    })

    python.on('close', async (code) => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      const success = code === 0

      try {
        await insertSyncLog(
          'sync_games',
          success ? 'success' : 'error',
          duration,
          success ? 'Games synchronized successfully' : error.slice(0, 500)
        )
      } catch (logError) {
        console.error('Failed to insert sync log:', logError)
      }

      resolve(NextResponse.json({
        success,
        message: success ? 'Games synchronized successfully' : 'Error occurred during synchronization',
        duration,
        output: output.slice(-500)
      }))
    })
  })
}
