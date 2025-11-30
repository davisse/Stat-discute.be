// Core Types for Claude Next-Gen (Project Alexandria)

export interface Project {
  id: string
  name: string
  description: string
  color: ProjectColor
  documents: Document[]
  conversations: Conversation[]
  connectedSources: ConnectedSource[]
  createdAt: Date
  updatedAt: Date
  totalSize: number // in bytes
}

export type ProjectColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange'

export interface Document {
  id: string
  name: string
  type: DocumentType
  size: number // in bytes
  content: string
  pages?: number
  uploadedAt: Date
  preview?: string // base64 for images
  extractedData?: ExtractedData
}

export type DocumentType = 'pdf' | 'image' | 'text' | 'csv' | 'json'

export interface ExtractedData {
  tables?: TableData[]
  text?: string
  charts?: ChartData[]
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  title: string
  data: Record<string, number>
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  uncertainty?: UncertaintyLevel
  toolCalls?: ToolCall[]
  timestamp: Date
  metrics?: MessageMetrics
}

export interface Citation {
  id: string
  documentId: string
  documentName: string
  pageNumber?: number
  startOffset: number
  endOffset: number
  text: string
  confidence: number
}

export type UncertaintyLevel = 'low' | 'medium' | 'high'

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
  status: 'pending' | 'success' | 'error'
}

export interface MessageMetrics {
  ttft: number // Time to First Token (ms)
  totalTime: number // Total response time (ms)
  tokensUsed: number
  contextTokens: number
}

// Claude Connect Types (D2)
export interface ConnectedSource {
  id: string
  type: SourceType
  name: string
  status: 'connected' | 'disconnected' | 'syncing'
  lastSynced?: Date
  documentsCount: number
}

export type SourceType = 'google-drive' | 'notion' | 'dropbox' | 'onedrive' | 'github'

// Tool Definitions for Function Calling (D1)
export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, ToolParameter>
    required: string[]
  }
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  enum?: string[]
}

// KPI Types
export interface KPIMetrics {
  benchmarkScores: {
    mmlu: number
    gpqa: number
    humanEval: number
  }
  hallucinationRate: number
  longContextUsage: number
  proRetention: number
  functionCallingGrowth: number
  avgTTFT: number
  availability: number
}

// UI State Types
export interface DocumentViewerState {
  isOpen: boolean
  documentId: string | null
  highlightedCitation: Citation | null
}
