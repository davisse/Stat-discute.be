import { generateJSON } from '@/lib/anthropic'
import {
  SYSTEM_PROMPT,
  getPromptForSequence,
  deriveBettingFactors,
  getFallbackNarrative,
} from '@/lib/ai/storytelling-prompts'
import type {
  GameDataForNarratives,
  GameNarratives,
  NarrativeSequence,
  IntroNarrative,
  AccrocheNarrative,
  ScoringNarrative,
  CombinedNarrative,
  DefenseNarrative,
  MLPredictionNarrative,
  SynthesisNarrative,
} from '@/lib/ai/types'

const SEQUENCES: NarrativeSequence[] = [
  'intro',
  'accroche',
  'scoring',
  'combined',
  'defense',
  'ml',
  'synthesis',
]

/**
 * Generate a single narrative sequence
 */
async function generateSequenceNarrative<T>(
  sequence: NarrativeSequence,
  data: GameDataForNarratives,
  factors?: ReturnType<typeof deriveBettingFactors>
): Promise<T | null> {
  const prompt = getPromptForSequence(sequence, data, factors)

  try {
    const result = await generateJSON<T>({
      system: SYSTEM_PROMPT,
      prompt,
      maxTokens: 512,
      temperature: 0.7,
    })
    return result
  } catch (error) {
    console.error(`Failed to generate ${sequence} narrative:`, error)
    return null
  }
}

/**
 * POST handler - Generate all narratives for a game
 * Accepts game data in request body and returns all narratives
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const gameData: GameDataForNarratives = await request.json()

    // Validate game data
    if (!gameData.awayTeam || !gameData.homeTeam) {
      return Response.json(
        { error: 'Invalid game data: missing team information' },
        { status: 400 }
      )
    }

    // Derive betting factors once for synthesis
    const factors = deriveBettingFactors(gameData)

    // Generate all narratives in parallel for speed
    const [intro, accroche, scoring, combined, defense, ml, synthesis] =
      await Promise.all([
        generateSequenceNarrative<IntroNarrative>('intro', gameData),
        generateSequenceNarrative<AccrocheNarrative>('accroche', gameData),
        generateSequenceNarrative<ScoringNarrative>('scoring', gameData),
        generateSequenceNarrative<CombinedNarrative>('combined', gameData),
        generateSequenceNarrative<DefenseNarrative>('defense', gameData),
        gameData.mlPrediction
          ? generateSequenceNarrative<MLPredictionNarrative>('ml', gameData)
          : Promise.resolve(null),
        generateSequenceNarrative<SynthesisNarrative>(
          'synthesis',
          gameData,
          factors
        ),
      ])

    // Build narratives object with fallbacks
    const narratives: GameNarratives = {
      intro: intro || (getFallbackNarrative('intro', gameData) as IntroNarrative),
      accroche:
        accroche ||
        (getFallbackNarrative('accroche', gameData) as AccrocheNarrative),
      scoring:
        scoring ||
        (getFallbackNarrative('scoring', gameData) as ScoringNarrative),
      combined:
        combined ||
        (getFallbackNarrative('combined', gameData) as CombinedNarrative),
      defense:
        defense ||
        (getFallbackNarrative('defense', gameData) as DefenseNarrative),
      ml: ml || (gameData.mlPrediction
        ? (getFallbackNarrative('ml', gameData) as MLPredictionNarrative)
        : undefined),
      synthesis:
        synthesis ||
        (getFallbackNarrative('synthesis', gameData) as SynthesisNarrative),
    }

    return Response.json({
      gameId,
      narratives,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating narratives:', error)
    return Response.json(
      { error: 'Failed to generate narratives' },
      { status: 500 }
    )
  }
}

/**
 * GET handler - Stream narratives one by one using SSE
 * Requires game data to be fetched first from the main route
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const url = new URL(request.url)

    // Fetch game data from the main storytelling API
    const baseUrl = url.origin
    const gameDataResponse = await fetch(
      `${baseUrl}/api/analysis/storytelling/${gameId}`
    )

    if (!gameDataResponse.ok) {
      return Response.json(
        { error: 'Failed to fetch game data' },
        { status: 500 }
      )
    }

    const gameData: GameDataForNarratives = await gameDataResponse.json()
    const factors = deriveBettingFactors(gameData)

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for (const sequence of SEQUENCES) {
          try {
            const narrative = await generateSequenceNarrative(
              sequence,
              gameData,
              sequence === 'synthesis' ? factors : undefined
            )

            const result = narrative || getFallbackNarrative(sequence, gameData)

            // Send as SSE event
            const event = `data: ${JSON.stringify({
              sequence,
              narrative: result,
              isComplete: sequence === 'synthesis',
            })}\n\n`

            controller.enqueue(encoder.encode(event))
          } catch (error) {
            console.error(`Error generating ${sequence}:`, error)

            // Send fallback
            const event = `data: ${JSON.stringify({
              sequence,
              narrative: getFallbackNarrative(sequence, gameData),
              isComplete: sequence === 'synthesis',
              error: true,
            })}\n\n`

            controller.enqueue(encoder.encode(event))
          }
        }

        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in SSE stream:', error)
    return Response.json(
      { error: 'Failed to create narrative stream' },
      { status: 500 }
    )
  }
}
