/**
 * API Route: /api/betting/agent/calibration
 *
 * Retrieve calibration metrics from the NBA Expert Bettor Agent's memory store.
 * Shows how well the agent's confidence predictions match actual outcomes.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface CalibrationBucket {
  confidence_bucket: number
  total_bets: number
  wins: number
  losses: number
  pushes: number
  actual_pct: number | null
  error_pct: number | null
}

interface DailySummary {
  date: string
  total_bets: number
  wins: number
  losses: number
  total_profit: number
}

interface LearningRule {
  id: number
  condition: string
  adjustment: number
  evidence: string
  created_at: string
  is_active: boolean
}

interface CalibrationResponse {
  success: boolean
  calibration: CalibrationBucket[]
  performance: {
    last_7_days: DailySummary[]
    total_bets: number
    total_profit: number
    win_rate: number | null
    roi: number | null
  }
  learning_rules: LearningRule[]
  overall: {
    avg_calibration_error: number | null
    brier_score: number | null
    total_settled: number
  }
  timestamp: string
}

/**
 * Run Python script to get calibration data
 */
async function getCalibrationData(): Promise<CalibrationResponse> {
  const agentPath = path.join(process.cwd(), '..', 'betting-agent')
  const pythonPath = path.join(agentPath, '.venv', 'bin', 'python')

  // Python script to extract calibration data as JSON
  const script = `
import sys
import json
sys.path.insert(0, '.')
from src.memory import get_memory_store

store = get_memory_store()

# Get calibration report
calibration = store.get_calibration_report()

# Get daily summaries
summaries = store.get_daily_summaries(days=7)

# Get learning rules
rules = store.get_active_rules()

# Calculate overall metrics
total_bets = sum(c.get('total_bets', 0) for c in calibration)
total_wins = sum(c.get('wins', 0) for c in calibration)
total_losses = sum(c.get('losses', 0) for c in calibration)
total_settled = total_wins + total_losses

# Calculate average calibration error
errors = [c.get('error_pct') for c in calibration if c.get('error_pct') is not None]
avg_error = sum(errors) / len(errors) if errors else None

# Calculate performance from summaries
total_profit = sum(s.get('total_profit', 0) or 0 for s in summaries)
summary_bets = sum(s.get('total_bets', 0) or 0 for s in summaries)
summary_wins = sum(s.get('wins', 0) or 0 for s in summaries)
summary_losses = sum(s.get('losses', 0) or 0 for s in summaries)

win_rate = (summary_wins / (summary_wins + summary_losses)) * 100 if (summary_wins + summary_losses) > 0 else None
roi = (total_profit / summary_bets) * 100 if summary_bets > 0 else None

result = {
    'success': True,
    'calibration': calibration,
    'performance': {
        'last_7_days': summaries,
        'total_bets': summary_bets,
        'total_profit': round(total_profit, 2),
        'win_rate': round(win_rate, 1) if win_rate is not None else None,
        'roi': round(roi, 1) if roi is not None else None,
    },
    'learning_rules': rules,
    'overall': {
        'avg_calibration_error': round(avg_error, 2) if avg_error is not None else None,
        'brier_score': None,  # TODO: Calculate Brier score
        'total_settled': total_settled,
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
        console.error(`Calibration script exited with code ${code}`)
        console.error('stderr:', stderr)

        resolve({
          success: false,
          calibration: [],
          performance: {
            last_7_days: [],
            total_bets: 0,
            total_profit: 0,
            win_rate: null,
            roi: null,
          },
          learning_rules: [],
          overall: {
            avg_calibration_error: null,
            brier_score: null,
            total_settled: 0,
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
        console.error('Failed to parse calibration output:', parseError)
        resolve({
          success: false,
          calibration: [],
          performance: {
            last_7_days: [],
            total_bets: 0,
            total_profit: 0,
            win_rate: null,
            roi: null,
          },
          learning_rules: [],
          overall: {
            avg_calibration_error: null,
            brier_score: null,
            total_settled: 0,
          },
          timestamp: new Date().toISOString(),
        })
      }
    })

    proc.on('error', (error) => {
      console.error('Failed to run calibration script:', error)
      resolve({
        success: false,
        calibration: [],
        performance: {
          last_7_days: [],
          total_bets: 0,
          total_profit: 0,
          win_rate: null,
          roi: null,
        },
        learning_rules: [],
        overall: {
          avg_calibration_error: null,
          brier_score: null,
          total_settled: 0,
        },
        timestamp: new Date().toISOString(),
      })
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      proc.kill('SIGTERM')
      resolve({
        success: false,
        calibration: [],
        performance: {
          last_7_days: [],
          total_bets: 0,
          total_profit: 0,
          win_rate: null,
          roi: null,
        },
        learning_rules: [],
        overall: {
          avg_calibration_error: null,
          brier_score: null,
          total_settled: 0,
        },
        timestamp: new Date().toISOString(),
      })
    }, 10000)
  })
}

/**
 * GET /api/betting/agent/calibration
 *
 * Get calibration metrics from the agent's memory store
 */
export async function GET() {
  try {
    const result = await getCalibrationData()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Calibration API error:', error)
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
