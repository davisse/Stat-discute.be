'use client'

import { useState, useRef, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { Send, Sparkles, AlertCircle, BarChart3, Table, LineChart } from 'lucide-react'

interface QueryIntent {
  entity_type: string
  entity_name?: string
  stat_category: string
  stat_name?: string
  timeframe: string
  n_games?: number
  chart_type: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  data?: any[]
  chartConfig?: any
  debug?: any
  intent?: QueryIntent
  error?: boolean
}

// Suggested queries for quick start
const SUGGESTED_QUERIES = [
  { icon: BarChart3, text: "Show me LeBron's scoring last 10 games", category: 'player' },
  { icon: Table, text: "What are the standings?", category: 'league' },
  { icon: LineChart, text: "Boston's scoring trend this season", category: 'team' },
  { icon: BarChart3, text: "Top 10 scorers in the league", category: 'league' },
  { icon: Table, text: "What props are available tonight?", category: 'betting' },
  { icon: LineChart, text: "Compare Tatum vs Brown PPG", category: 'comparison' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus()
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setIsOllamaConnected(data.ollama === 'connected')
    } catch {
      setIsOllamaConnected(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    }

    // Build conversation history for context (include intents from previous assistant messages)
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      intent: msg.intent
    }))

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        data: data.data,
        chartConfig: data.chartConfig,
        debug: data.debug,
        intent: data.intent, // Store intent for future context
        error: !data.success
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (query: string) => {
    sendMessage(query)
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-11rem)] max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">NBA Chat</h1>
              <p className="text-gray-500 text-sm">
                Ask questions about players, teams, stats, and betting insights
              </p>
            </div>
          </div>

          {/* Ollama status indicator */}
          {isOllamaConnected === false && (
            <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              <span>AI assistant offline. Start Ollama with: <code className="bg-gray-800 px-1 rounded">ollama serve</code></span>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Sparkles className="w-12 h-12 text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Ask me about NBA players, teams, statistics, or betting insights.
                I'll show you data visualizations to help understand the numbers.
              </p>

              {/* Suggested queries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTED_QUERIES.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg
                             text-left text-gray-300 hover:bg-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <suggestion.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  data={msg.data}
                  chartConfig={msg.chartConfig}
                  debug={msg.debug}
                />
              ))}
              {isLoading && <ChatMessage role="assistant" content="" isLoading />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="py-4 border-t border-gray-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about players, teams, stats..."
              disabled={isLoading || isOllamaConnected === false}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3
                       text-white placeholder-gray-500 focus:outline-none focus:border-gray-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isOllamaConnected === false}
              className="px-4 py-3 bg-white text-black rounded-lg font-medium
                       hover:bg-gray-200 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-2 text-center">
            Powered by Ollama + Local NBA Database
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
