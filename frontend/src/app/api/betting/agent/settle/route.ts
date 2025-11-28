/**
 * API Route: /api/betting/agent/settle
 *
 * Manually settle a wager in the NBA Expert Bettor Agent's memory store.
 */
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface SettleRequest {
  wager_id: number
  outcome: 'WIN' | 'LOSS' | 'PUSH'
  profit?: number
}

interface SettleResponse {
  success: boolean
  wager_id: number
  outcome: string
  profit: number
  message: string
  timestamp: string
}

/**
 * Run Python script to settle a wager
 */
async function settleWager(
  wagerId: number,
  outcome: string,
  profit?: number
): Promise<SettleResponse> {
  const agentPath = path.join(process.cwd(), '..', 'betting-agent')
  const pythonPath = path.join(agentPath, '.venv', 'bin', 'python')

  // Calculate profit if not provided
  let calculatedProfit = profit
  if (calculatedProfit === undefined) {
    if (outcome === 'WIN') {
      calculatedProfit = 0.91 // Standard -110 odds payout
    } else if (outcome === 'LOSS') {
      calculatedProfit = -1.0
    } else {
      calculatedProfit = 0.0 // PUSH
    }
  }

  // Python script to settle the wager
  const script = `
import sys
import json
sys.path.insert(0, '.')
from src.memory import get_memory_store

store = get_memory_store()

try:
    store.settle_wager(${wagerId}, outcome="${outcome}", profit=${calculatedProfit})
    result = {
        'success': True,
        'wager_id': ${wagerId},
        'outcome': '${outcome}',
        'profit': ${calculatedProfit},
        'message': 'Wager settled successfully'
    }
except Exception as e:
    result = {
        'success': False,
        'wager_id': ${wagerId},
        'outcome': '${outcome}',
        'profit': 0,
        'message': str(e)
    }

print(json.dumps(result))
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
        console.error(`Settle script exited with code ${code}`)
        console.error('stderr:', stderr)

        resolve({
          success: false,
          wager_id: wagerId,
          outcome,
          profit: calculatedProfit || 0,
          message: `Script exited with code ${code}: ${stderr}`,
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
        console.error('Failed to parse settle output:', parseError)
        resolve({
          success: false,
          wager_id: wagerId,
          outcome,
          profit: calculatedProfit || 0,
          message: `Failed to parse output: ${parseError}`,
          timestamp: new Date().toISOString(),
        })
      }
    })

    proc.on('error', (error) => {
      console.error('Failed to run settle script:', error)
      resolve({
        success: false,
        wager_id: wagerId,
        outcome,
        profit: calculatedProfit || 0,
        message: `Failed to run script: ${error.message}`,
        timestamp: new Date().toISOString(),
      })
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      proc.kill('SIGTERM')
      resolve({
        success: false,
        wager_id: wagerId,
        outcome,
        profit: calculatedProfit || 0,
        message: 'Script timed out',
        timestamp: new Date().toISOString(),
      })
    }, 10000)
  })
}

/**
 * POST /api/betting/agent/settle
 *
 * Manually settle a wager
 *
 * Request body:
 * {
 *   "wager_id": 123,
 *   "outcome": "WIN" | "LOSS" | "PUSH",
 *   "profit": 0.91  // optional, calculated from outcome if not provided
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: SettleRequest = await request.json()
    const { wager_id, outcome, profit } = body

    // Validate wager_id
    if (!wager_id || typeof wager_id !== 'number' || wager_id < 1) {
      return NextResponse.json(
        { error: 'Invalid wager_id parameter' },
        { status: 400 }
      )
    }

    // Validate outcome
    if (!['WIN', 'LOSS', 'PUSH'].includes(outcome)) {
      return NextResponse.json(
        { error: 'Invalid outcome parameter. Must be: WIN, LOSS, or PUSH' },
        { status: 400 }
      )
    }

    // Validate profit if provided
    if (profit !== undefined && typeof profit !== 'number') {
      return NextResponse.json(
        { error: 'Invalid profit parameter. Must be a number' },
        { status: 400 }
      )
    }

    console.log(`[Agent] Settling wager ${wager_id}: ${outcome}`)

    const result = await settleWager(wager_id, outcome, profit)

    console.log(
      `[Agent] Settle result: ${result.success ? 'Success' : 'Failed'} - ${result.message}`
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Settle API error:', error)
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
