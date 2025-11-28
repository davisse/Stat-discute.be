/**
 * API Route: /api/betting/agent/analyze
 *
 * Integrates with the NBA Expert Bettor Agent (Python) for deep analysis
 * of betting opportunities using the Council of Experts architecture.
 *
 * Endpoints:
 *   POST - Run analysis for a betting query
 *   GET  - Health check and agent status
 */
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// Types matching the agent's output
interface AgentRecommendation {
  action: 'BET' | 'LEAN_BET' | 'NO_BET' | 'FADE' | 'NEED_LINE'
  selection: string
  line: number | null
  edge: number
  edge_raw: number
  cover_probability: number
  kelly_fraction: number
  projected_margin: number | null
  confidence: number
  reasoning: string
  key_factors: string[]
  risk_factors: string[]
  data_quality: 'FRESH' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE'
  debate_winner: 'BULL' | 'BEAR' | 'NEUTRAL'
  debate_edge: number
  bull_score: number
  bear_score: number
  wager_id?: number
}

interface AgentResponse {
  success: boolean
  query: string
  depth: string
  recommendation: AgentRecommendation | null
  game_data: {
    game_id: string
    home_team: string
    away_team: string
    selection: string
    line: number | null
  } | null
  errors: string[]
  processing_time_ms: number
  timestamp: string
}

interface AnalyzeRequest {
  query: string
  depth?: 'quick' | 'standard' | 'deep'
}

/**
 * Run the Python betting agent as a subprocess
 */
async function runBettingAgent(
  query: string,
  depth: string = 'standard'
): Promise<AgentResponse> {
  const startTime = Date.now()

  // Path to the betting agent
  const agentPath = path.join(process.cwd(), '..', 'betting-agent')
  const pythonPath = path.join(agentPath, '.venv', 'bin', 'python')

  return new Promise((resolve) => {
    const args = ['-m', 'src.main', 'analyze', query, '--depth', depth, '--format', 'json']

    const proc = spawn(pythonPath, args, {
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
      const processingTime = Date.now() - startTime

      if (code !== 0) {
        console.error(`Agent process exited with code ${code}`)
        console.error('stderr:', stderr)

        resolve({
          success: false,
          query,
          depth,
          recommendation: null,
          game_data: null,
          errors: [`Agent exited with code ${code}`, stderr].filter(Boolean),
          processing_time_ms: processingTime,
          timestamp: new Date().toISOString(),
        })
        return
      }

      try {
        // Try to extract JSON from stdout (skip any non-JSON output)
        const jsonMatch = stdout.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const agentState = JSON.parse(jsonMatch[0])

          resolve({
            success: true,
            query,
            depth,
            recommendation: agentState.recommendation || null,
            game_data: agentState.game_data
              ? {
                  game_id: agentState.game_data.game_id || '',
                  home_team: agentState.game_data.home_team || '',
                  away_team: agentState.game_data.away_team || '',
                  selection: agentState.game_data.selection || '',
                  line: agentState.game_data.line || null,
                }
              : null,
            errors: agentState.errors || [],
            processing_time_ms: processingTime,
            timestamp: new Date().toISOString(),
          })
        } else {
          // No JSON found - return error
          resolve({
            success: false,
            query,
            depth,
            recommendation: null,
            game_data: null,
            errors: ['No JSON output from agent', stdout.slice(0, 500)],
            processing_time_ms: processingTime,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (parseError) {
        console.error('Failed to parse agent output:', parseError)
        resolve({
          success: false,
          query,
          depth,
          recommendation: null,
          game_data: null,
          errors: [
            `Failed to parse agent output: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            stdout.slice(0, 500),
          ],
          processing_time_ms: processingTime,
          timestamp: new Date().toISOString(),
        })
      }
    })

    proc.on('error', (error) => {
      console.error('Failed to start agent process:', error)
      resolve({
        success: false,
        query,
        depth,
        recommendation: null,
        game_data: null,
        errors: [`Failed to start agent: ${error.message}`],
        processing_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      })
    })

    // Timeout after 60 seconds for deep analysis
    const timeout = depth === 'deep' ? 60000 : 30000
    setTimeout(() => {
      proc.kill('SIGTERM')
      resolve({
        success: false,
        query,
        depth,
        recommendation: null,
        game_data: null,
        errors: [`Agent timed out after ${timeout / 1000} seconds`],
        processing_time_ms: timeout,
        timestamp: new Date().toISOString(),
      })
    }, timeout)
  })
}

/**
 * POST /api/betting/agent/analyze
 *
 * Run betting analysis using the NBA Expert Bettor Agent
 *
 * Request body:
 * {
 *   "query": "Lakers -5 vs Celtics",
 *   "depth": "standard"  // optional: "quick" | "standard" | "deep"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { query, depth = 'standard' } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query parameter' },
        { status: 400 }
      )
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Query too long (max 500 characters)' },
        { status: 400 }
      )
    }

    if (!['quick', 'standard', 'deep'].includes(depth)) {
      return NextResponse.json(
        { error: 'Invalid depth parameter. Must be: quick, standard, or deep' },
        { status: 400 }
      )
    }

    console.log(`[Agent] Analyzing: "${query}" (depth: ${depth})`)

    const result = await runBettingAgent(query, depth)

    console.log(
      `[Agent] Completed in ${result.processing_time_ms}ms - ` +
        `${result.success ? 'Success' : 'Failed'}: ${result.recommendation?.action || 'N/A'}`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Agent API error:', error)
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

/**
 * GET /api/betting/agent/analyze
 *
 * Health check and agent status
 */
export async function GET() {
  const agentPath = path.join(process.cwd(), '..', 'betting-agent')
  const pythonPath = path.join(agentPath, '.venv', 'bin', 'python')

  // Check if Python environment exists
  let pythonAvailable = false
  try {
    const { execSync } = await import('child_process')
    execSync(`${pythonPath} --version`, { stdio: 'pipe' })
    pythonAvailable = true
  } catch {
    pythonAvailable = false
  }

  return NextResponse.json({
    status: pythonAvailable ? 'available' : 'unavailable',
    agent_path: agentPath,
    python_path: pythonPath,
    supported_depths: ['quick', 'standard', 'deep'],
    endpoints: {
      analyze: {
        method: 'POST',
        body: {
          query: 'string (required)',
          depth: 'quick | standard | deep (optional, default: standard)',
        },
      },
      status: {
        method: 'GET',
      },
    },
    timestamp: new Date().toISOString(),
  })
}
