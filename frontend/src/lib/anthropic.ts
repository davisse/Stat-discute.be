/**
 * Anthropic API Client
 *
 * Functions for interacting with Claude API
 * Used for structured JSON generation and analysis
 */

// ============================================
// CONFIGURATION
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

// ============================================
// TYPES
// ============================================

export interface GenerateJSONOptions<T> {
  system: string
  prompt: string
  maxTokens?: number
  temperature?: number
  model?: string
  schema?: Record<string, unknown>
}

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | AnthropicContentBlock[]
}

export interface AnthropicContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result'
  text?: string
  source?: {
    type: 'base64'
    media_type: string
    data: string
  }
}

export interface AnthropicResponse {
  id: string
  type: 'message'
  role: 'assistant'
  content: AnthropicContentBlock[]
  model: string
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use'
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract JSON from a text response that may contain markdown code blocks
 */
function extractJSON(text: string): string {
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find JSON object or array directly
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }

  // Return as-is if no patterns match
  return text.trim()
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Generate a JSON response using Claude
 * Parses and validates the response as JSON
 */
export async function generateJSON<T>(
  options: GenerateJSONOptions<T>
): Promise<T> {
  const {
    system,
    prompt,
    maxTokens = 4096,
    temperature = 0.3,
    model = DEFAULT_MODEL,
  } = options

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: `${system}\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object.`,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
    }

    const data: AnthropicResponse = await response.json()

    // Extract text content from response
    const textContent = data.content.find(block => block.type === 'text')
    if (!textContent?.text) {
      throw new Error('No text content in Anthropic response')
    }

    // Parse JSON from the response
    const jsonString = extractJSON(textContent.text)
    const result = JSON.parse(jsonString) as T

    return result
  } catch (error) {
    console.error('[ANTHROPIC] JSON generation failed:', error)
    throw error
  }
}

/**
 * Generate a text completion using Claude
 */
export async function generateText(
  prompt: string,
  options?: {
    system?: string
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<string> {
  const {
    system = 'You are a helpful assistant.',
    maxTokens = 4096,
    temperature = 0.7,
    model = DEFAULT_MODEL,
  } = options || {}

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
    }

    const data: AnthropicResponse = await response.json()

    // Extract text content from response
    const textContent = data.content.find(block => block.type === 'text')
    return textContent?.text || ''
  } catch (error) {
    console.error('[ANTHROPIC] Text generation failed:', error)
    throw error
  }
}

/**
 * Check if Anthropic API is available
 */
export async function isAnthropicAvailable(): Promise<boolean> {
  return !!ANTHROPIC_API_KEY
}

/**
 * Generate a conversational response with message history
 */
export async function generateConversation(
  messages: AnthropicMessage[],
  options?: {
    system?: string
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<string> {
  const {
    system = 'You are a helpful assistant.',
    maxTokens = 4096,
    temperature = 0.7,
    model = DEFAULT_MODEL,
  } = options || {}

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
    }

    const data: AnthropicResponse = await response.json()

    const textContent = data.content.find(block => block.type === 'text')
    return textContent?.text || ''
  } catch (error) {
    console.error('[ANTHROPIC] Conversation generation failed:', error)
    throw error
  }
}
