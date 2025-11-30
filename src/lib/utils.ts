import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DocumentType, ProjectColor, UncertaintyLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getDocumentTypeFromFile(file: File): DocumentType {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type

  if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf'
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) return 'image'
  if (mimeType === 'text/csv' || extension === 'csv') return 'csv'
  if (mimeType === 'application/json' || extension === 'json') return 'json'
  return 'text'
}

export function getDocumentIcon(type: DocumentType): string {
  switch (type) {
    case 'pdf':
      return 'FileText'
    case 'image':
      return 'Image'
    case 'csv':
      return 'Table'
    case 'json':
      return 'Braces'
    default:
      return 'File'
  }
}

export function getProjectColorClasses(color: ProjectColor): {
  bg: string
  text: string
  border: string
  hover: string
} {
  const colors = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      hover: 'hover:bg-green-200',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-200',
    },
    pink: {
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      border: 'border-pink-300',
      hover: 'hover:bg-pink-200',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-200',
    },
  }
  return colors[color]
}

export function getUncertaintyLabel(level: UncertaintyLevel): string {
  switch (level) {
    case 'low':
      return 'Haute confiance'
    case 'medium':
      return 'Confiance moyenne'
    case 'high':
      return 'Faible confiance'
  }
}

export function getUncertaintyColor(level: UncertaintyLevel): string {
  switch (level) {
    case 'low':
      return 'uncertainty-low'
    case 'medium':
      return 'uncertainty-medium'
    case 'high':
      return 'uncertainty-high'
  }
}

// Simulate AI response generation with citations
export function generateMockResponse(
  query: string,
  documents: { id: string; name: string; content: string }[]
): {
  content: string
  citations: Array<{
    documentId: string
    documentName: string
    text: string
    startOffset: number
    endOffset: number
    confidence: number
  }>
  uncertainty: UncertaintyLevel
} {
  // This is a mock function - in production this would call the Claude API
  const hasDocuments = documents.length > 0

  if (!hasDocuments) {
    return {
      content: "Je n'ai pas de documents dans ce projet pour répondre à votre question. Veuillez uploader des documents pertinents ou connecter une source de données.",
      citations: [],
      uncertainty: 'high',
    }
  }

  // Generate mock citations from documents
  const citations = documents.slice(0, 2).map((doc, idx) => ({
    documentId: doc.id,
    documentName: doc.name,
    text: doc.content.slice(0, 100) + '...',
    startOffset: 0,
    endOffset: 100,
    confidence: 0.95 - idx * 0.1,
  }))

  return {
    content: `Basé sur l'analyse des documents fournis, voici ma réponse concernant "${query}":\n\nSelon les informations contenues dans **${documents[0].name}** [1], ${documents[0].content.slice(0, 150)}...\n\n${documents.length > 1 ? `Cette analyse est corroborée par les données présentes dans **${documents[1].name}** [2].` : ''}\n\nLes points clés à retenir sont:\n- Point 1 basé sur l'analyse documentaire\n- Point 2 avec référence aux sources\n- Point 3 synthétisant les informations`,
    citations,
    uncertainty: citations[0]?.confidence > 0.9 ? 'low' : 'medium',
  }
}

// Time formatting for metrics
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// Calculate total project size
export const MAX_PROJECT_SIZE = 500 * 1024 * 1024 // 500 MB

export function getProjectSizePercentage(totalSize: number): number {
  return Math.round((totalSize / MAX_PROJECT_SIZE) * 100)
}
