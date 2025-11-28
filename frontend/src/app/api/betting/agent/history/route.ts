/**
 * API Route: /api/betting/agent/history
 *
 * Retrieve wager history from the NBA Expert Bettor Agent's memory store.
 */
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface Wager {
  id: number
  game_id: string
  bet_type: string
  selection: string
  line: number
  confidence: number
  predicted_edge: number
  outcome: 'WIN' | 'LOSS' | 'PUSH' | null
  profit: number | null
  created_at: string
  settled_at: string | null
}

interface HistoryResponse {
  success: boolean
  wagers: Wager[]
  summary: {
    total: number
    wins: number
    losses: number
    pushes: number
    pending: number
    total_profit: number
    win_rate: number | null
    roi: number | null
  }
  timestamp: string
}

/**
 * Run Python script to get wager history
 */
async function getWagerHistory(
  limit: number = 20,
  unsettled: boolean = false
): Promise<HistoryResponse> {
  const agentPath = path.join(process.cwd(), '..', 'betting-agent')
  const pythonPath = path.join(agentPath, '.venv', 'bin', 'python')

  // Python script to extract history as JSON
  const script = `
import sys
import json
sys.path.insert(0, '.')
from src.memory import get_memory_store

store = get_memory_store()
${unsettled ? 'wagers = store.get_unsettled_wagers()' : `wagers = store.get_recent_wagers(limit=${limit})`}

# Calculate summary
total = len(wagers)
wins = sum(1 for w in wagers if w.get('outcome') == 'WIN')
losses = sum(1 for w in wagers if w.get('outcome') == 'LOSS')
pushes = sum(1 for w in wagers if w.get('outcome') == 'PUSH')
pending = sum(1 for w in wagers if w.get('outcome') is None)

settled_wagers = [w for w in wagers if w.get('outcome') is not None]
total_profit = sum(w.get('profit', 0) or 0 for w in settled_wagers)

win_rate = (wins / (wins + losses)) * 100 if (wins + losses) > 0 else None
roi = (total_profit / len(settled_wagers)) * 100 if settled_wagers else None

result = {
    'success': True,
    'wagers': wagers,
    'summary': {
        'total': total,
        'wins': wins,
        'losses': losses,
        'pushes': pushes,
        'pending': pending,
        'total_profit': round(total_profit, 2),
        'win_rate': round(win_rate, 1) if win_rate is not None else None,
        'roi': round(roi, 1) if roi is not None else None,
    }
}
print(json.dumps(result, default=str))
`

  return new Promise((resolve) => {
    const proc = spawn(pythonPath, ['-c', script], {
      cwd: agentPath,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`History script exited with code ${code}`)
        console.error('stderr:', stderr)

        resolve({
          success: false,
          wagers: [],
          summary: {
            total: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            pending: 0,
            total_profit: 0,
            win_rate: null,
            roi: null,
          },
          timestamp: new Date().toISOString(),
        })
        return
      }

      try {
        const result = JSON.parse(stdout.trim())
        resolve({
          ...result,
          timestamp: new Date().toISOString(),
        })
      } catch (parseError) {
        console.error('Failed to parse history output:', parseError)
        resolve({
          success: false,
          wagers: [],
          summary: {
            total: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            pending: 0,
            total_profit: 0,
            win_rate: null,
            roi: null,
          },
          timestamp: new Date().toISOString(),
        })
      }
    })

    proc.on('error', (error) => {
      console.error('Failed to run history script:', error)
      resolve({
        success: false,
        wagers: [],
        summary: {
          total: 0,
          wins: 0,
          losses: 0,
          pushes: 0,
          pending: 0,
          total_profit: 0,
          win_rate: null,
          roi: null,
        },
        timestamp: new Date().toISOString(),
      })
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      proc.kill('SIGTERM')
      resolve({
        success: false,
        wagers: [],
        summary: {
          total: 0,
          wins: 0,
          losses: 0,
          pushes: 0,
          pending: 0,
          total_profit: 0,
          win_rate: null,
          roi: null,
        },
        timestamp: new Date().toISOString(),
      })
    }, 10000)
  })
}

/**
 * GET /api/betting/agent/history
 *
 * Get wager history from the agent's memory store
 *
 * Query params:
 * - limit: number of wagers to return (default: 20)
 * - unsettled: if true, only return unsettled wagers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const unsettled = searchParams.get('unsettled') === 'true'

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter (must be 1-100)' },
        { status: 400 }
      )
    }

    const result = await getWagerHistory(limit, unsettled)
    return NextResponse.json(result)
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
