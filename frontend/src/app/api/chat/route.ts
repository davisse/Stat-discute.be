/**
 * Chat API - Orchestrating Agent
 *
 * Coordinates specialized subagents to process user queries:
 * 1. Intent Parser (LLM) - Extracts structured intent from natural language
 * 2. Query Builder (Templates) - Builds safe SQL from intent
 * 3. Response Generator (LLM) - Creates natural language summary
 */

import { NextResponse } from 'next/server'
import { parseIntent, QueryIntent, ConversationMessage } from '@/lib/chat/intent-parser'
import { buildAndExecuteQuery, getChartConfig, transformDataForChart, ChartConfig } from '@/lib/chat/query-builder'
import { generateCompletion, isOllamaAvailable } from '@/lib/ollama'

export interface ChatRequest {
  message: string
  conversationHistory?: ConversationMessage[]
}

export interface ChatResponse {
  success: boolean
  message: string
  data?: any[]
  chartConfig?: ChartConfig
  intent?: QueryIntent
  error?: string
  debug?: {
    template: string
    parseTime: number
    queryTime: number
    responseTime: number
  }
}

// Response generation system prompt
const RESPONSE_GENERATION_PROMPT = `You are an NBA analyst providing insights from data.

Given query results and the original question, provide a brief 1-3 sentence summary that:
1. Highlights the key finding or trend
2. Notes any notable outliers or patterns
3. Provides relevant context (especially for betting-related queries)

CRITICAL RULES:
- ONLY use numbers from the CALCULATED STATS section provided - do NOT invent or estimate any other numbers
- If average is provided as 35.3, say "35.3" - do NOT say "around 35" or "roughly 45"
- Never mention "rolling average" or other metrics not in the data

Keep it conversational but insightful. Don't just repeat the data - add value with analysis.
If there's no data, explain what might be wrong or suggest alternatives.
Use player/team names, not IDs. Format numbers nicely (e.g., "27.4 PPG").`

/**
 * Calculate summary statistics from data for a given stat field
 */
function calculateStats(data: any[], statField: string): { avg: number; min: number; max: number } | null {
  const values = data
    .map(row => parseFloat(row[statField] || row.points || row.value || 0))
    .filter(v => !isNaN(v) && v > 0)

  if (values.length === 0) return null

  const sum = values.reduce((a, b) => a + b, 0)
  return {
    avg: Math.round((sum / values.length) * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values)
  }
}

/**
 * Generate natural language response from query results
 */
async function generateResponse(
  question: string,
  data: any[],
  intent: QueryIntent
): Promise<string> {
  if (data.length === 0) {
    return `I couldn't find any data for "${intent.entity_name || 'that query'}". This might be because the player/team name wasn't recognized, or there's no data for the requested timeframe.`
  }

  const dataPreview = JSON.stringify(data.slice(0, 5), null, 2)

  // Calculate actual stats to prevent hallucination
  const statField = intent.stat_name || 'points'
  const stats = calculateStats(data, statField)
  const statsInfo = stats
    ? `\n\nCALCULATED STATS (use these exact numbers):\n- Average: ${stats.avg}\n- Min: ${stats.min}\n- Max: ${stats.max}`
    : ''

  const prompt = `Question: "${question}"

Intent: ${intent.entity_type} ${intent.entity_name || ''} - ${intent.stat_category}

Data (first 5 rows):
${dataPreview}

Total rows: ${data.length}${statsInfo}

IMPORTANT: Use ONLY the exact numbers from CALCULATED STATS above. Do NOT invent any other statistics.
Provide a brief analytical summary:`

  try {
    const response = await generateCompletion({
      prompt,
      system: RESPONSE_GENERATION_PROMPT,
      temperature: 0.3
    })

    // Clean up response - remove thinking tags if present (deepseek-r1 specific)
    let cleanResponse = response
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .trim()

    return cleanResponse || `Found ${data.length} results for ${intent.entity_name || 'your query'}.`
  } catch (error) {
    console.error('Response generation error:', error)
    return `Found ${data.length} results for ${intent.entity_name || 'your query'}.`
  }
}

/**
 * Main API handler - Orchestrating Agent
 */
export async function POST(request: Request) {
  const startTime = Date.now()
  let parseTime = 0
  let queryTime = 0
  let responseTime = 0

  try {
    const body: ChatRequest = await request.json()
    const { message, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Please provide a message.',
        error: 'Invalid request: message required'
      } as ChatResponse, { status: 400 })
    }

    // Check Ollama availability
    const ollamaAvailable = await isOllamaAvailable()
    if (!ollamaAvailable) {
      return NextResponse.json({
        success: false,
        message: 'The AI assistant is currently unavailable. Please ensure Ollama is running.',
        error: 'Ollama service not available. Run: ollama serve'
      } as ChatResponse, { status: 503 })
    }

    // ============================================
    // STEP 1: Intent Extraction (LLM Subagent)
    // ============================================
    const parseStart = Date.now()
    const intent = await parseIntent(message, conversationHistory)
    parseTime = Date.now() - parseStart

    if (!intent) {
      return NextResponse.json({
        success: false,
        message: "I couldn't understand that question. Try asking about a specific player, team, or game. For example: 'Show me LeBron's scoring last 10 games' or 'What are the standings?'",
        error: 'Intent parsing failed',
        debug: { template: 'none', parseTime, queryTime: 0, responseTime: 0 }
      } as ChatResponse)
    }

    console.log('Parsed intent:', JSON.stringify(intent, null, 2))

    // ============================================
    // STEP 2: Query Execution (Template Subagent)
    // ============================================
    const queryStart = Date.now()
    const queryResult = await buildAndExecuteQuery(intent)
    queryTime = Date.now() - queryStart

    if (!queryResult.success) {
      return NextResponse.json({
        success: false,
        message: `I understood your question about ${intent.entity_name || intent.entity_type}, but encountered an error fetching the data.`,
        intent,
        error: queryResult.error,
        debug: { template: queryResult.template, parseTime, queryTime, responseTime: 0 }
      } as ChatResponse)
    }

    // ============================================
    // STEP 3: Chart Configuration
    // ============================================
    const chartConfig = getChartConfig(intent, queryResult.data)
    const transformedData = transformDataForChart(queryResult.data, chartConfig)

    // ============================================
    // STEP 4: Response Generation (LLM Subagent)
    // ============================================
    const responseStart = Date.now()
    const responseMessage = await generateResponse(message, queryResult.data, intent)
    responseTime = Date.now() - responseStart

    // ============================================
    // Final Response Assembly
    // ============================================
    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: transformedData,
      chartConfig,
      intent,
      debug: {
        template: queryResult.template,
        parseTime,
        queryTime,
        responseTime
      }
    } as ChatResponse)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ChatResponse, { status: 500 })
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  const ollamaAvailable = await isOllamaAvailable()

  return NextResponse.json({
    status: 'ok',
    ollama: ollamaAvailable ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
}
