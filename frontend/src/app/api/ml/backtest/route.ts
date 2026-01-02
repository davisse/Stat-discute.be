import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import type { BacktestResponse } from '@/types/ml'

const execAsync = promisify(exec)

// Paths from environment or default - built at runtime to avoid Turbopack symlink issues
function getMLBasePath() {
  // Use env var if set, otherwise construct path at runtime
  const base = process.env.ML_SCRIPTS_PATH || path.join(process.cwd(), '..', '1.DATABASE', 'etl', 'ml')
  return base
}

function getScriptPath() {
  return path.join(getMLBasePath(), 'backtest_summary.py')
}

function getPythonPath() {
  // Use env var for python if set, otherwise use venv python
  if (process.env.PYTHON_PATH) {
    return process.env.PYTHON_PATH
  }
  const venvBin = process.platform === 'win32' ? 'Scripts' : 'bin'
  return path.join(getMLBasePath(), ['venv', venvBin, 'python'].join(path.sep))
}

// Cache the backtest results (expensive to compute)
let cachedResult: BacktestResponse | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

export async function GET() {
  try {
    // Check cache first
    const now = Date.now()
    if (cachedResult && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedResult)
    }

    // Execute the Python script with --json flag
    const scriptPath = getScriptPath()
    const pythonPath = getPythonPath()

    const { stdout, stderr } = await execAsync(
      `${pythonPath} "${scriptPath}" --json`,
      {
        cwd: path.dirname(scriptPath),
        timeout: 300000, // 5 minute timeout for backtest
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        env: {
          ...process.env,
          PYTHONPATH: path.resolve(process.cwd(), '..', '1.DATABASE', 'etl'),
        },
      }
    )

    if (stderr) {
      console.warn('[ML Backtest] Python stderr:', stderr)
    }

    if (!stdout.trim()) {
      return NextResponse.json(
        { error: 'No output from backtest script', thresholds: [], byModel: {}, features: [] },
        { status: 500 }
      )
    }

    const backtest: BacktestResponse = JSON.parse(stdout.trim())

    if (backtest.error) {
      return NextResponse.json(backtest, { status: 404 })
    }

    // Update cache
    cachedResult = backtest
    cacheTimestamp = now

    return NextResponse.json(backtest)
  } catch (error) {
    console.error('[ML Backtest] Error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse backtest output', thresholds: [], byModel: {}, features: [] },
        { status: 500 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('ModuleNotFoundError')) {
      return NextResponse.json(
        {
          error: 'Python dependencies not installed. Run: pip install scikit-learn xgboost pandas numpy psycopg2-binary',
          thresholds: [],
          byModel: {},
          features: [],
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Backtest failed: ${errorMessage}`, thresholds: [], byModel: {}, features: [] },
      { status: 500 }
    )
  }
}

// Revalidate every hour
export const revalidate = 3600
