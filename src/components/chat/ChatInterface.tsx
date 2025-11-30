'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Sparkles, ArrowDown } from 'lucide-react'
import { useAppStore } from '@/store'
import { Button, Input } from '../ui'
import { ChatMessage } from './ChatMessage'
import { cn, generateMockResponse } from '@/lib/utils'
import type { Project, Conversation, Message, Citation } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface ChatInterfaceProps {
  project: Project
  conversation: Conversation
  onCitationClick: (citation: Citation) => void
}

export function ChatInterface({
  project,
  conversation,
  onCitationClick,
}: ChatInterfaceProps) {
  const { addMessage } = useAppStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    addMessage(project.id, conversation.id, {
      role: 'user',
      content: userMessage,
    })

    // Simulate AI response
    setIsTyping(true)

    // Simulate TTFT delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate mock response with citations
    const startTime = Date.now()
    const response = generateMockResponse(
      userMessage,
      project.documents.map((d) => ({
        id: d.id,
        name: d.name,
        content: d.content,
      }))
    )

    // Simulate streaming delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const totalTime = Date.now() - startTime

    // Create citations with proper structure
    const citations: Citation[] = response.citations.map((c, idx) => ({
      id: uuidv4(),
      documentId: c.documentId,
      documentName: c.documentName,
      text: c.text,
      startOffset: c.startOffset,
      endOffset: c.endOffset,
      confidence: c.confidence,
    }))

    // Add assistant message
    addMessage(project.id, conversation.id, {
      role: 'assistant',
      content: response.content,
      citations,
      uncertainty: response.uncertainty,
      metrics: {
        ttft: 450 + Math.random() * 100,
        totalTime,
        tokensUsed: Math.floor(response.content.length / 4),
        contextTokens: project.documents.reduce((acc, d) => acc + d.content.length / 4, 0),
      },
    })

    setIsTyping(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-claude-primary to-claude-secondary rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Commencez votre analyse
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Posez une question sur vos documents. Claude analysera le contenu
              et fournira des réponses avec des citations précises.
            </p>
            {project.documents.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                <p className="text-sm text-yellow-800">
                  <strong>Conseil :</strong> Uploadez des documents pour
                  permettre à Claude de les analyser et de citer ses sources.
                </p>
              </div>
            )}
            {project.documents.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
                <p className="text-sm text-green-800">
                  <strong>{project.documents.length} document(s)</strong> disponible(s)
                  pour l&apos;analyse. Claude peut maintenant répondre avec des
                  citations précises.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCitationClick={onCitationClick}
              />
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-claude-primary to-claude-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-8 p-2 bg-white shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Posez une question sur vos documents..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-claude-primary focus:ring-2 focus:ring-claude-primary focus:ring-opacity-20 focus:outline-none transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            <button
              type="button"
              className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-12 px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {project.documents.length} document(s) en contexte ·{' '}
            {Math.round(
              project.documents.reduce((acc, d) => acc + d.content.length / 4, 0)
            ).toLocaleString()}{' '}
            tokens
          </p>
          <p className="text-xs text-gray-400">
            Opus Next · Citations activées
          </p>
        </div>
      </div>
    </div>
  )
}
