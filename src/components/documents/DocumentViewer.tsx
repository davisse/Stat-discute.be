'use client'

import React, { useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, Download, ExternalLink, FileText } from 'lucide-react'
import { useAppStore } from '@/store'
import { Button, Badge } from '../ui'
import { cn, formatFileSize, formatDate } from '@/lib/utils'
import type { Document, Citation } from '@/types'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const { documentViewer, highlightCitation } = useAppStore()
  const contentRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(100)

  // Scroll to highlighted citation
  useEffect(() => {
    if (documentViewer.highlightedCitation && contentRef.current) {
      const highlightedElement = contentRef.current.querySelector('.doc-highlight')
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [documentViewer.highlightedCitation])

  const renderContent = () => {
    const citation = documentViewer.highlightedCitation

    if (document.type === 'image' && document.preview) {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={document.preview}
            alt={document.name}
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        </div>
      )
    }

    // Text-based content with citation highlighting
    let content = document.content

    if (citation && citation.documentId === document.id) {
      // Highlight the cited text
      const before = content.slice(0, citation.startOffset)
      const highlighted = content.slice(citation.startOffset, citation.endOffset)
      const after = content.slice(citation.endOffset)

      return (
        <div
          ref={contentRef}
          className="p-6 font-mono text-sm whitespace-pre-wrap"
          style={{ fontSize: `${zoom}%` }}
        >
          {before}
          <mark className="doc-highlight bg-yellow-200 px-1 rounded">
            {highlighted}
          </mark>
          {after}
        </div>
      )
    }

    return (
      <div
        ref={contentRef}
        className="p-6 font-mono text-sm whitespace-pre-wrap"
        style={{ fontSize: `${zoom}%` }}
      >
        {content || 'Contenu du document non disponible en aperçu.'}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge size="sm">{document.type.toUpperCase()}</Badge>
              <span>{formatFileSize(document.size)}</span>
              {document.pages && <span>{document.pages} pages</span>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Citation info banner */}
      {documentViewer.highlightedCitation && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm text-yellow-800">
              Citation mise en évidence
            </span>
          </div>
          <button
            onClick={() => highlightCitation(null)}
            className="text-xs text-yellow-600 hover:text-yellow-800"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">{renderContent()}</div>

      {/* Footer with metadata */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Uploadé le {formatDate(document.uploadedAt)}
        </p>
      </div>
    </div>
  )
}
