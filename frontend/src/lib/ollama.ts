/**
 * Ollama Client
 *
 * Functions for interacting with local Ollama LLM server
 * Used for chat completions and text generation
 */

// ============================================
// CONFIGURATION
// ============================================

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

// ============================================
// TYPES
// ============================================

export interface GenerateCompletionOptions {
  prompt: string
  system?: string
  temperature?: number
  model?: string
  maxTokens?: number
  stream?: boolean
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaStreamChunk {
  model: string
  created_at: string
  response: string
  done: boolean
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check if Ollama server is available and responding
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get list of available models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.models?.map((m: { name: string }) => m.name) || []
  } catch {
    return []
  }
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

/**
 * Generate a completion using Ollama
 */
export async function generateCompletion(
  options: GenerateCompletionOptions
): Promise<string> {
  const {
    prompt,
    system,
    temperature = 0.7,
    model = DEFAULT_MODEL,
    maxTokens,
    stream = false,
  } = options

  try {
    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      stream,
      options: {
        temperature,
      },
    }

    if (system) {
      requestBody.system = system
    }

    if (maxTokens) {
      (requestBody.options as Record<string, unknown>).num_predict = maxTokens
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data: OllamaResponse = await response.json()
    return data.response
  } catch (error) {
    console.error('[OLLAMA] Generation failed:', error)
    throw error
  }
}

/**
 * Generate a completion with streaming response
 */
export async function* generateCompletionStream(
  options: GenerateCompletionOptions
): AsyncGenerator<string, void, unknown> {
  const {
    prompt,
    system,
    temperature = 0.7,
    model = DEFAULT_MODEL,
    maxTokens,
  } = options

  try {
    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      stream: true,
      options: {
        temperature,
      },
    }

    if (system) {
      requestBody.system = system
    }

    if (maxTokens) {
      (requestBody.options as Record<string, unknown>).num_predict = maxTokens
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const data: OllamaStreamChunk = JSON.parse(line)
          if (data.response) {
            yield data.response
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.error('[OLLAMA] Stream generation failed:', error)
    throw error
  }
}

/**
 * Generate a chat completion (conversational format)
 */
export async function generateChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens,
  } = options || {}

  try {
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      stream: false,
      options: {
        temperature,
      },
    }

    if (maxTokens) {
      (requestBody.options as Record<string, unknown>).num_predict = maxTokens
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    return data.message?.content || ''
  } catch (error) {
    console.error('[OLLAMA] Chat completion failed:', error)
    throw error
  }
}

/**
 * Generate embeddings for text
 */
export async function generateEmbedding(
  text: string,
  model: string = 'nomic-embed-text'
): Promise<number[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    return data.embedding || []
  } catch (error) {
    console.error('[OLLAMA] Embedding generation failed:', error)
    throw error
  }
}
