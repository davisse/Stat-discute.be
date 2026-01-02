'use client'

import { DynamicChart } from './DynamicChart'

interface ChartConfig {
  type: string
  dataField: string
  labelField: string
  title: string
  threshold?: number
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  data?: any[]
  chartConfig?: ChartConfig
  isLoading?: boolean
  debug?: {
    template: string
    parseTime: number
    queryTime: number
    responseTime: number
  }
}

export function ChatMessage({ role, content, data, chartConfig, isLoading, debug }: ChatMessageProps) {
  const isUser = role === 'user'

  if (isLoading) {
    return (
      <div className="flex gap-3 py-4">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">AI</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 py-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">AI</span>
        </div>
      )}

      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        {/* Message content */}
        <div
          className={`inline-block rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-white text-black'
              : 'bg-gray-900 border border-gray-800 text-gray-100'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {/* Chart visualization */}
        {!isUser && data && data.length > 0 && chartConfig && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <DynamicChart data={data} config={chartConfig} />
          </div>
        )}

        {/* Debug info (collapsed by default) */}
        {!isUser && debug && (
          <details className="mt-2 text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">
              Debug info
            </summary>
            <div className="mt-1 p-2 bg-gray-900 rounded text-left font-mono">
              <p>Template: {debug.template}</p>
              <p>Parse: {debug.parseTime}ms | Query: {debug.queryTime}ms | Response: {debug.responseTime}ms</p>
              <p>Total: {debug.parseTime + debug.queryTime + debug.responseTime}ms</p>
            </div>
          </details>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-sm text-black">You</span>
        </div>
      )}
    </div>
  )
}
