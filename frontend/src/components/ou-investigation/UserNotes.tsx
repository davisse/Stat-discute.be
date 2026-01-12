'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserNotesProps {
  gameId: string // Unique identifier for localStorage key
  homeTeamAbbr: string
  awayTeamAbbr: string
}

interface NoteData {
  content: string
  prediction: 'over' | 'under' | null
  confidence: number // 1-5
  updatedAt: string
}

const STORAGE_PREFIX = 'ou-investigation-notes-'

export function UserNotes({
  gameId,
  homeTeamAbbr,
  awayTeamAbbr
}: UserNotesProps) {
  const [note, setNote] = useState<NoteData>({
    content: '',
    prediction: null,
    confidence: 3,
    updatedAt: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const storageKey = `${STORAGE_PREFIX}${gameId}`

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as NoteData
          setNote(parsed)
          setLastSaved(parsed.updatedAt)
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, [storageKey])

  // Auto-save with debounce
  const saveNote = useCallback((noteData: NoteData) => {
    if (typeof window !== 'undefined') {
      const dataToSave = {
        ...noteData,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      setLastSaved(dataToSave.updatedAt)
      setIsSaving(false)
    }
  }, [storageKey])

  // Debounced save effect
  useEffect(() => {
    if (note.content || note.prediction) {
      setIsSaving(true)
      const timeout = setTimeout(() => {
        saveNote(note)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [note, saveNote])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(prev => ({ ...prev, content: e.target.value }))
  }

  const handlePredictionChange = (prediction: 'over' | 'under' | null) => {
    setNote(prev => ({
      ...prev,
      prediction: prev.prediction === prediction ? null : prediction
    }))
  }

  const handleConfidenceChange = (confidence: number) => {
    setNote(prev => ({ ...prev, confidence }))
  }

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
      setNote({
        content: '',
        prediction: null,
        confidence: 3,
        updatedAt: ''
      })
      setLastSaved(null)
    }
  }

  const formatLastSaved = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">08</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Mes Notes
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto text-zinc-500 hover:text-zinc-400 transition-colors"
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
          {/* Prediction Selection */}
          <div className="mb-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              Ma prédiction
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePredictionChange('over')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                  note.prediction === 'over'
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : 'bg-black/30 border border-zinc-700 text-zinc-500 hover:border-green-500/50 hover:text-green-400/70'
                }`}
              >
                Over
              </button>
              <button
                onClick={() => handlePredictionChange('under')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                  note.prediction === 'under'
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : 'bg-black/30 border border-zinc-700 text-zinc-500 hover:border-red-500/50 hover:text-red-400/70'
                }`}
              >
                Under
              </button>
            </div>
          </div>

          {/* Confidence Level */}
          {note.prediction && (
            <div className="mb-4">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                Niveau de confiance
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleConfidenceChange(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      note.confidence >= level
                        ? note.prediction === 'over'
                          ? 'bg-green-500/30 text-green-400'
                          : 'bg-red-500/30 text-red-400'
                        : 'bg-black/30 text-zinc-600 hover:bg-black/50'
                    }`}
                    aria-label={`Confiance niveau ${level}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-zinc-600 mt-1 px-1">
                <span>Faible</span>
                <span>Élevée</span>
              </div>
            </div>
          )}

          {/* Notes Textarea */}
          <div className="mb-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              Notes personnelles
            </div>
            <textarea
              value={note.content}
              onChange={handleContentChange}
              placeholder={`Mes observations pour ${awayTeamAbbr} @ ${homeTeamAbbr}...`}
              className="w-full h-32 sm:h-40 bg-black/30 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          {/* Footer: Status and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              {isSaving ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sauvegarde en cours...</span>
                </>
              ) : lastSaved ? (
                <>
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Sauvegardé {formatLastSaved(lastSaved)}</span>
                </>
              ) : (
                <span className="text-zinc-600">Non sauvegardé</span>
              )}
            </div>

            {/* Clear Button */}
            {(note.content || note.prediction) && (
              <button
                onClick={handleClear}
                className="text-[10px] text-zinc-500 hover:text-red-400 uppercase tracking-wider transition-colors"
              >
                Effacer tout
              </button>
            )}
          </div>

          {/* Insight Box */}
          <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                Vos notes sont stockées localement dans votre navigateur.
                <span className="text-zinc-500"> Elles ne sont jamais envoyées à nos serveurs.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default UserNotes
