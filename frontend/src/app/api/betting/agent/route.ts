import { NextResponse } from 'next/server'

const AGENT_API_URL = process.env.BETTING_AGENT_URL || 'http://localhost:8001'

/**
 * Proxy to the betting agent FastAPI server.
 *
 * Supports two endpoints:
 * - GET: Fetch tonight's totals with Monte Carlo analysis
 * - POST: Run custom Monte Carlo simulation
 */

export async function GET() {
  try {
    const response = await fetch(`${AGENT_API_URL}/api/tonight/totals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache - we want fresh data
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Agent API error', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    // If agent is not running, return a helpful error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error: 'Betting agent not running',
          details: 'Start the agent with: cd betting-agent && uvicorn src.api.server:app --port 8001',
          fallback: true
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to connect to betting agent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action = 'simulate', ...params } = body

    let endpoint = '/api/monte-carlo/simulate'
    if (action === 'batch') {
      endpoint = '/api/monte-carlo/batch'
    }

    const response = await fetch(`${AGENT_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Agent API error', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error: 'Betting agent not running',
          details: 'Start the agent with: cd betting-agent && uvicorn src.api.server:app --port 8001',
          fallback: true
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to connect to betting agent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
