/**
 * /analyse Page - Bento Grid Analysis Builder
 *
 * Phase 1 MVP Features:
 * - Empty state with "Add component" button
 * - ComponentPalette modal for widget selection
 * - BentoGrid with 3 basic widgets (PlayerStats, Notes, Comparison)
 * - Widget controls (config ⚙️ + delete 🗑️)
 * - Editable analysis title
 * - localStorage persistence (auto-save)
 *
 * Design System: STAT-DISCUTE monochrome strict
 * Background: Black with dots (from AppLayout)
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { BentoGrid, EmptyState } from './components/BentoGrid'
import { ComponentPalette } from './components/ComponentPalette'
import { WidgetWrapper } from './components/WidgetWrapper'
import { PlayerStatsWidget } from './components/widgets/PlayerStatsWidget'
import { NotesWidget } from './components/widgets/NotesWidget'
import { ComparisonWidget } from './components/widgets/ComparisonWidget'
import {
  Widget,
  WidgetType,
  WidgetConfig,
  AnalysisState,
} from './types'
import {
  generateWidgetId,
  getComponentDefinition,
  saveAnalysisToStorage,
  loadAnalysisFromStorage,
} from './utils'

export default function AnalysePage() {
  // State management
  const [state, setState] = React.useState<AnalysisState>({
    title: 'Nouvelle analyse',
    widgets: [],
    isModalOpen: false,
    editingWidgetId: null,
  })

  const [isEditingTitle, setIsEditingTitle] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = loadAnalysisFromStorage()
    if (saved) {
      setState((prev) => ({
        ...prev,
        title: saved.title,
        widgets: saved.widgets,
      }))
    }
  }, [])

  // Auto-save to localStorage whenever state changes
  React.useEffect(() => {
    saveAnalysisToStorage({
      title: state.title,
      widgets: state.widgets,
    })
  }, [state.title, state.widgets])

  // Add widget
  const handleAddWidget = (type: WidgetType) => {
    const definition = getComponentDefinition(type)
    if (!definition) return

    const newWidget: Widget = {
      id: generateWidgetId(),
      type,
      size: definition.defaultSize,
      config: {
        title: definition.name,
      },
    }

    setState((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      isModalOpen: false,
    }))
  }

  // Delete widget
  const handleDeleteWidget = (widgetId: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
    }))
  }

  // Update widget config
  const handleConfigChange = (widgetId: string, newConfig: WidgetConfig) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, config: newConfig } : w
      ),
    }))
  }

  // Config button clicked (Phase 2: open config modal)
  const handleConfigClick = (widgetId: string) => {
    // Phase 1: Just log for now
    // Phase 2: Open ConfigModal with widget config
    console.log('Config widget:', widgetId)
  }

  // Render widget by type
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'player-stats':
        return <PlayerStatsWidget config={widget.config} />

      case 'notes':
        return (
          <NotesWidget
            config={widget.config}
            onConfigChange={(newConfig) =>
              handleConfigChange(widget.id, newConfig)
            }
          />
        )

      case 'comparison':
        return <ComparisonWidget config={widget.config} />

      default:
        return (
          <div className="text-[var(--color-gray-400)] text-center">
            Widget type "{widget.type}" not implemented yet
          </div>
        )
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header
          className={cn(
            'sticky top-0 z-30',
            'bg-black/80 backdrop-blur-sm',
            'border-b border-[var(--color-gray-800)]',
            'px-[var(--space-6)] py-[var(--space-4)]',
          )}
        >
          <div className="flex justify-between items-center max-w-[1600px] mx-auto">
            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={state.title}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, title: e.target.value }))
                }
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false)
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false)
                    // Reset to saved value if needed
                  }
                }}
                autoFocus
                className={cn(
                  'bg-transparent',
                  'border-b border-white',
                  'text-[var(--text-xl)] font-[var(--font-semibold)] text-white',
                  'outline-none',
                  'px-[var(--space-2)] py-1',
                )}
                style={{ fontFamily: 'var(--font-family-sans)' }}
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className={cn(
                  'text-[var(--text-xl)] font-[var(--font-semibold)] text-white',
                  'cursor-pointer',
                  'hover:text-[var(--color-gray-400)]',
                  'transition-colors duration-[var(--transition-fast)]',
                  'px-[var(--space-2)] py-1',
                )}
                style={{ fontFamily: 'var(--font-family-sans)' }}
              >
                {state.title}
              </h1>
            )}

            {/* Actions */}
            <div className="flex gap-[var(--space-3)]">
              {/* Add Component Button */}
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, isModalOpen: true }))
                }
                className={cn(
                  'inline-flex items-center justify-center',
                  'px-[var(--space-4)] py-[var(--space-2)]',
                  'rounded-[var(--radius-md)]',
                  'bg-white !text-black',
                  'border border-white',
                  'hover:bg-transparent hover:!text-white',
                  'hover:shadow-[var(--shadow-md)]',
                  'transition-all duration-[var(--transition-normal)]',
                  'font-medium text-[var(--text-sm)]',
                )}
              >
                <span className="mr-[var(--space-2)]">+</span>
                Ajouter
              </button>

              {/* Save Button (visual only, auto-saves to localStorage) */}
              <button
                className={cn(
                  'inline-flex items-center justify-center',
                  'px-[var(--space-4)] py-[var(--space-2)]',
                  'rounded-[var(--radius-md)]',
                  'bg-transparent',
                  'border border-[var(--color-gray-800)]',
                  'text-[var(--color-gray-400)]',
                  'hover:border-white hover:text-white',
                  'transition-all duration-[var(--transition-normal)]',
                  'font-medium text-[var(--text-sm)]',
                )}
                title="Auto-sauvegardé"
              >
                💾 Sauvegardé
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {state.widgets.length === 0 ? (
            // Empty state
            <BentoGrid>
              <EmptyState
                onAdd={() =>
                  setState((prev) => ({ ...prev, isModalOpen: true }))
                }
              />
            </BentoGrid>
          ) : (
            // Widgets grid
            <BentoGrid>
              {state.widgets.map((widget) => (
                <WidgetWrapper
                  key={widget.id}
                  title={widget.config.title || 'Sans titre'}
                  size={widget.size}
                  onConfig={() => handleConfigClick(widget.id)}
                  onDelete={() => handleDeleteWidget(widget.id)}
                >
                  {renderWidget(widget)}
                </WidgetWrapper>
              ))}
            </BentoGrid>
          )}
        </main>
      </div>

      {/* Component Palette Modal */}
      <ComponentPalette
        isOpen={state.isModalOpen}
        onClose={() => setState((prev) => ({ ...prev, isModalOpen: false }))}
        onSelect={handleAddWidget}
      />
    </AppLayout>
  )
}
