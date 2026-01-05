/**
 * Intent Parser
 *
 * Extracts structured intent from natural language queries
 * Uses LLM for understanding and extracting query parameters
 */

import { generateCompletion } from '@/lib/ollama'

// ============================================
// TYPES
// ============================================

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface QueryIntent {
  // Entity identification
  entity_type: 'player' | 'team' | 'game' | 'league' | 'comparison'
  entity_name?: string
  entity_id?: number | string

  // Query specifics
  stat_category:
    | 'scoring'
    | 'rebounds'
    | 'assists'
    | 'defense'
    | 'efficiency'
    | 'betting'
    | 'standings'
    | 'schedule'
    | 'general'
    | 'comparison'
  stat_name?: string

  // Time filters
  time_period?: 'last_5' | 'last_10' | 'season' | 'career' | 'today' | 'custom'
  start_date?: string
  end_date?: string

  // Additional filters
  opponent?: string
  home_away?: 'home' | 'away' | 'all'
  game_result?: 'win' | 'loss' | 'all'

  // Comparison
  comparison_entity?: string
  comparison_type?: 'vs' | 'head_to_head' | 'stats'

  // Query modifiers
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  limit?: number

  // Raw extraction confidence
  confidence: number
}

// ============================================
// SYSTEM PROMPT FOR INTENT EXTRACTION
// ============================================

const INTENT_EXTRACTION_PROMPT = `You are an NBA statistics query parser. Extract structured intent from natural language questions about NBA statistics.

ENTITY TYPES:
- player: Questions about individual players (stats, performance, trends)
- team: Questions about teams (standings, team stats, records)
- game: Questions about specific games or today's games
- league: League-wide stats, leaders, comparisons
- comparison: Comparing players or teams

STAT CATEGORIES:
- scoring: points, field goals, 3-pointers, free throws
- rebounds: offensive, defensive, total rebounds
- assists: assists, turnovers, assist ratio
- defense: steals, blocks, defensive rating
- efficiency: PER, true shooting, effective FG%
- betting: ATS records, over/under, trends
- standings: wins, losses, conference rank
- schedule: upcoming games, recent games
- general: general info, no specific stat
- comparison: comparing two entities

TIME PERIODS:
- last_5: Last 5 games
- last_10: Last 10 games
- season: Current season (default)
- career: Career stats
- today: Today's games/stats
- custom: Specific date range

CRITICAL: Always return valid JSON. No additional text.

EXAMPLES:
Q: "How many points did LeBron score last game?"
{"entity_type":"player","entity_name":"LeBron James","stat_category":"scoring","stat_name":"points","time_period":"last_5","limit":1,"confidence":0.9}

Q: "Show me Lakers standings"
{"entity_type":"team","entity_name":"Lakers","stat_category":"standings","time_period":"season","confidence":0.95}

Q: "Compare Steph Curry and Dame Lillard 3-point shooting"
{"entity_type":"comparison","entity_name":"Stephen Curry","comparison_entity":"Damian Lillard","stat_category":"scoring","stat_name":"three_pointers","time_period":"season","comparison_type":"stats","confidence":0.85}

Q: "What are the betting trends for Celtics?"
{"entity_type":"team","entity_name":"Celtics","stat_category":"betting","time_period":"season","confidence":0.9}

Q: "Who leads the league in assists?"
{"entity_type":"league","stat_category":"assists","stat_name":"assists","sort_by":"assists","sort_order":"desc","limit":10,"confidence":0.95}`

// ============================================
// INTENT PARSING
// ============================================

/**
 * Parse natural language query into structured intent
 */
export async function parseIntent(
  message: string,
  conversationHistory?: ConversationMessage[]
): Promise<QueryIntent | null> {
  try {
    // Build context from conversation history
    let contextPrompt = ''
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-4) // Last 2 exchanges
      contextPrompt = `CONVERSATION CONTEXT:\n${recentMessages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n')}\n\n`
    }

    const prompt = `${contextPrompt}USER QUERY: "${message}"

Extract the intent as JSON. If you cannot understand the query, return {"entity_type":"general","stat_category":"general","confidence":0.3}.

Return ONLY valid JSON:`

    const response = await generateCompletion({
      prompt,
      system: INTENT_EXTRACTION_PROMPT,
      temperature: 0.1, // Low temperature for consistent extraction
    })

    // Parse JSON from response
    const jsonString = extractJSON(response)
    const intent = JSON.parse(jsonString) as QueryIntent

    // Validate required fields
    if (!intent.entity_type || !intent.stat_category) {
      console.error('Invalid intent structure:', intent)
      return null
    }

    // Set defaults
    intent.confidence = intent.confidence || 0.5
    intent.time_period = intent.time_period || 'season'

    return intent
  } catch (error) {
    console.error('Intent parsing error:', error)
    return null
  }
}

/**
 * Extract JSON from a text response that may contain extra text
 */
function extractJSON(text: string): string {
  // Try to find JSON object in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  // If no JSON found, try to clean up the response
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove thinking tags
    .trim()

  const cleanedMatch = cleaned.match(/\{[\s\S]*\}/)
  if (cleanedMatch) {
    return cleanedMatch[0]
  }

  throw new Error('No valid JSON found in response')
}

// ============================================
// INTENT UTILITIES
// ============================================

/**
 * Check if intent is for a specific player
 */
export function isPlayerIntent(intent: QueryIntent): boolean {
  return intent.entity_type === 'player' && !!intent.entity_name
}

/**
 * Check if intent is for a specific team
 */
export function isTeamIntent(intent: QueryIntent): boolean {
  return intent.entity_type === 'team' && !!intent.entity_name
}

/**
 * Check if intent is a comparison query
 */
export function isComparisonIntent(intent: QueryIntent): boolean {
  return intent.entity_type === 'comparison' || !!intent.comparison_entity
}

/**
 * Check if intent requires betting data
 */
export function isBettingIntent(intent: QueryIntent): boolean {
  return intent.stat_category === 'betting'
}

/**
 * Get a human-readable description of the intent
 */
export function describeIntent(intent: QueryIntent): string {
  const parts: string[] = []

  if (intent.entity_name) {
    parts.push(intent.entity_name)
  }

  if (intent.stat_name) {
    parts.push(intent.stat_name)
  } else if (intent.stat_category !== 'general') {
    parts.push(intent.stat_category)
  }

  if (intent.time_period && intent.time_period !== 'season') {
    parts.push(`(${intent.time_period.replace('_', ' ')})`)
  }

  if (intent.comparison_entity) {
    parts.push(`vs ${intent.comparison_entity}`)
  }

  return parts.join(' ') || 'general query'
}

/**
 * Normalize entity names for database matching
 */
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}
