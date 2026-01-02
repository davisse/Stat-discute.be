import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import type { PredictionsResponse } from '@/types/ml'

const execAsync = promisify(exec)

// Paths from environment or default - built at runtime to avoid Turbopack symlink issues
function getMLBasePath() {
  // Use env var if set, otherwise construct path at runtime
  const base = process.env.ML_SCRIPTS_PATH || path.join(process.cwd(), '..', '1.DATABASE', 'etl', 'ml')
  return base
}

function getScriptPath() {
  return path.join(getMLBasePath(), 'predict_tonight.py')
}

function getPythonPath() {
  // Use env var for python if set, otherwise use venv python
  if (process.env.PYTHON_PATH) {
    return process.env.PYTHON_PATH
  }
  const venvBin = process.platform === 'win32' ? 'Scripts' : 'bin'
  return path.join(getMLBasePath(), ['venv', venvBin, 'python'].join(path.sep))
}

export async function GET() {
  try {
    // Execute the Python script with --json flag
    const scriptPath = getScriptPath()
    const pythonPath = getPythonPath()

    const { stdout, stderr } = await execAsync(
      `${pythonPath} "${scriptPath}" --json`,
      {
        cwd: path.dirname(scriptPath),
        timeout: 120000, // 2 minute timeout for model training
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: {
          ...process.env,
          PYTHONPATH: path.resolve(process.cwd(), '..', '1.DATABASE', 'etl'),
        },
      }
    )

    // Log any stderr warnings (but don't fail)
    if (stderr) {
      console.warn('[ML Predictions] Python stderr:', stderr)
    }

    // Parse JSON output
    if (!stdout.trim()) {
      return NextResponse.json(
        { error: 'No output from prediction script', games: [] },
        { status: 500 }
      )
    }

    const predictions: PredictionsResponse = JSON.parse(stdout.trim())

    // Check for errors in the response
    if (predictions.error) {
      return NextResponse.json(predictions, { status: 404 })
    }

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('[ML Predictions] Error:', error)

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse prediction output', games: [] },
        { status: 500 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check for common issues
    if (errorMessage.includes('ModuleNotFoundError')) {
      return NextResponse.json(
        {
          error: 'Python dependencies not installed. Run: pip install scikit-learn xgboost pandas numpy psycopg2-binary',
          games: [],
        },
        { status: 500 }
      )
    }

    if (errorMessage.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Prediction script not found', games: [] },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Prediction failed: ${errorMessage}`, games: [] },
      { status: 500 }
    )
  }
}

// Cache for 5 minutes - predictions don't change frequently
export const revalidate = 300
