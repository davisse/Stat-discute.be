import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface NarrativeGenerationOptions {
  entityType: 'team' | 'player' | 'game' | 'betting'
  entityId: string
  context: string
  language?: 'fr' | 'en'
  style?: 'journalistic' | 'analytical' | 'casual'
  maxTokens?: number
}

export interface RAGQueryOptions {
  query: string
  context: string[]
  language?: 'fr' | 'en'
  maxTokens?: number
}

export interface GenerateJSONOptions {
  system: string
  prompt: string
  maxTokens?: number
  temperature?: number
}

/**
 * Generate a JSON response from Claude
 * Used for structured data generation (narratives, analyses)
 */
export async function generateJSON<T>(options: GenerateJSONOptions): Promise<T> {
  const {
    system,
    prompt,
    maxTokens = 1024,
    temperature = 0.7,
  } = options

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    temperature,
    system: `${system}

IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, just raw JSON.`,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent?.text) {
    throw new Error('No text response from Claude')
  }

  // Try to extract JSON from the response
  const text = textContent.text.trim()

  // Remove potential markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                    text.match(/^\{[\s\S]*\}$/) ||
                    text.match(/^\[[\s\S]*\]$/)

  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text

  try {
    return JSON.parse(jsonStr.trim()) as T
  } catch (error) {
    console.error('Failed to parse JSON response:', jsonStr)
    throw new Error(`Failed to parse JSON response: ${error}`)
  }
}

/**
 * Generate a journalistic narrative about NBA data
 */
export async function generateNarrative(options: NarrativeGenerationOptions): Promise<string> {
  const {
    entityType,
    entityId,
    context,
    language = 'fr',
    style = 'journalistic',
    maxTokens = 1024,
  } = options

  const styleGuide = {
    journalistic: language === 'fr'
      ? "Écris comme un journaliste sportif français expert NBA. Utilise un ton dynamique et engageant avec des statistiques précises."
      : "Write like an expert NBA sports journalist. Use a dynamic and engaging tone with precise statistics.",
    analytical: language === 'fr'
      ? "Analyse les données de manière objective et méthodique. Mets en avant les tendances et insights clés."
      : "Analyze the data objectively and methodically. Highlight key trends and insights.",
    casual: language === 'fr'
      ? "Écris de manière accessible pour un fan NBA. Utilise un ton conversationnel mais informé."
      : "Write in an accessible way for an NBA fan. Use a conversational but informed tone.",
  }

  const entityPrompts = {
    team: language === 'fr'
      ? `Génère une analyse narrative pour l'équipe ${entityId}.`
      : `Generate a narrative analysis for team ${entityId}.`,
    player: language === 'fr'
      ? `Génère un portrait statistique du joueur ${entityId}.`
      : `Generate a statistical portrait of player ${entityId}.`,
    game: language === 'fr'
      ? `Génère une preview/recap du match ${entityId}.`
      : `Generate a preview/recap for game ${entityId}.`,
    betting: language === 'fr'
      ? `Analyse les tendances betting pour ${entityId}.`
      : `Analyze betting trends for ${entityId}.`,
  }

  const systemPrompt = language === 'fr'
    ? `Tu es un expert NBA spécialisé dans l'analyse de données sportives. ${styleGuide[style]}

Règles:
- Base-toi UNIQUEMENT sur les données fournies dans le contexte
- N'invente jamais de statistiques ou d'informations
- Utilise des transitions fluides entre les points
- Mets en valeur les insights les plus importants
- Garde un format concis mais complet`
    : `You are an NBA expert specialized in sports data analysis. ${styleGuide[style]}

Rules:
- Base your analysis ONLY on the data provided in the context
- Never invent statistics or information
- Use smooth transitions between points
- Highlight the most important insights
- Keep a concise but complete format`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `${entityPrompts[entityType]}

Données contextuelles:
${context}`,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  return textContent?.text || ''
}

/**
 * Answer a question using RAG context
 */
export async function answerWithRAG(options: RAGQueryOptions): Promise<string> {
  const {
    query,
    context,
    language = 'fr',
    maxTokens = 1024,
  } = options

  const systemPrompt = language === 'fr'
    ? `Tu es un assistant expert NBA qui répond aux questions en utilisant les données fournies.

Règles:
- Réponds UNIQUEMENT en te basant sur le contexte fourni
- Si l'information n'est pas dans le contexte, dis-le clairement
- Cite les sources de données quand c'est pertinent
- Sois précis avec les statistiques
- Garde un ton professionnel mais accessible`
    : `You are an NBA expert assistant who answers questions using the provided data.

Rules:
- Answer ONLY based on the provided context
- If the information is not in the context, say so clearly
- Cite data sources when relevant
- Be precise with statistics
- Keep a professional but accessible tone`

  const contextText = context.join('\n\n---\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Contexte disponible:
${contextText}

Question: ${query}`,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  return textContent?.text || ''
}

/**
 * Extract key facts from text for embedding
 */
export async function extractKeyFacts(text: string, language: 'fr' | 'en' = 'fr'): Promise<string[]> {
  const systemPrompt = language === 'fr'
    ? `Extrait les faits clés statistiques et analytiques de ce texte NBA.
       Retourne une liste JSON de phrases factuelles courtes.`
    : `Extract key statistical and analytical facts from this NBA text.
       Return a JSON list of short factual sentences.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: text,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent?.text) return []

  try {
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // If JSON parsing fails, split by newlines
    return textContent.text.split('\n').filter((line) => line.trim().length > 0)
  }

  return []
}

export default anthropic
