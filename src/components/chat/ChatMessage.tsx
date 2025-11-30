'use client'

import React from 'react'
import {
  Sparkles,
  User,
  Clock,
  Zap,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'
import { Badge } from '../ui'
import { cn, formatDuration, getUncertaintyLabel, getUncertaintyColor } from '@/lib/utils'
import type { Message, Citation, UncertaintyLevel } from '@/types'

interface ChatMessageProps {
  message: Message
  onCitationClick: (citation: Citation) => void
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  // Parse content to add citation markers
  const renderContent = () => {
    if (!isAssistant || !message.citations?.length) {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    // Simple rendering with citation numbers
    let content = message.content

    // Replace [1], [2], etc. with clickable citations
    const citationRegex = /\[(\d+)\]/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index))
      }

      const citationNumber = parseInt(match[1], 10)
      const citation = message.citations[citationNumber - 1]

      if (citation) {
        parts.push(
          <button
            key={`citation-${match.index}`}
            onClick={() => onCitationClick(citation)}
            className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-claude-light text-claude-primary rounded-full hover:bg-claude-primary hover:text-white transition-colors mx-0.5"
            title={`Source: ${citation.documentName}`}
          >
            {citationNumber}
          </button>
        )
      } else {
        parts.push(match[0])
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return <div className="whitespace-pre-wrap">{parts}</div>
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isAssistant ? '' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isAssistant
            ? 'bg-gradient-to-br from-claude-primary to-claude-secondary'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        )}
      >
        {isAssistant ? (
          <Sparkles className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col max-w-[80%]',
          isAssistant ? 'items-start' : 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isAssistant
              ? 'bg-gray-100 rounded-tl-none'
              : 'bg-claude-primary text-white rounded-tr-none'
          )}
        >
          <div className={cn('prose-claude', !isAssistant && 'text-white')}>
            {renderContent()}
          </div>
        </div>

        {/* Uncertainty indicator (C2) */}
        {isAssistant && message.uncertainty && (
          <div className="mt-2">
            <UncertaintyBadge level={message.uncertainty} />
          </div>
        )}

        {/* Citations list */}
        {isAssistant && message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 font-medium">Sources citées :</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, index) => (
                <button
                  key={citation.id}
                  onClick={() => onCitationClick(citation)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs hover:bg-gray-50 hover:border-claude-primary transition-all group"
                >
                  <span className="w-4 h-4 bg-claude-light text-claude-primary rounded-full flex items-center justify-center text-[10px] font-medium">
                    {index + 1}
                  </span>
                  <FileText className="w-3 h-3 text-gray-400 group-hover:text-claude-primary" />
                  <span className="text-gray-700 truncate max-w-[150px]">
                    {citation.documentName}
                  </span>
                  <span className="text-gray-400">
                    ({Math.round(citation.confidence * 100)}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        {isAssistant && message.metrics && (
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              TTFT: {formatDuration(message.metrics.ttft)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Total: {formatDuration(message.metrics.totalTime)}
            </span>
            <span>{message.metrics.tokensUsed.toLocaleString()} tokens</span>
          </div>
        )}
      </div>
    </div>
  )
}

function UncertaintyBadge({ level }: { level: UncertaintyLevel }) {
  const icons = {
    low: CheckCircle,
    medium: Info,
    high: AlertTriangle,
  }
  const Icon = icons[level]

  return (
    <span className={cn('uncertainty-badge', getUncertaintyColor(level))}>
      <Icon className="w-3 h-3" />
      {getUncertaintyLabel(level)}
    </span>
  )
}
