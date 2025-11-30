'use client'

import React, { useState } from 'react'
import { Modal, Button, Input } from '../ui'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import type { ProjectColor } from '@/types'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

const PROJECT_COLORS: { value: ProjectColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { value: 'green', label: 'Vert', class: 'bg-green-500' },
  { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
  { value: 'pink', label: 'Rose', class: 'bg-pink-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
]

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const createProject = useAppStore((state) => state.createProject)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<ProjectColor>('blue')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      createProject(name.trim(), description.trim(), color)
      setName('')
      setDescription('')
      setColor('blue')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau Projet"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!name.trim()}
          >
            Créer le projet
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du projet"
          placeholder="Ex: Analyse Financière Q4 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnel)
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-claude-primary focus:ring-2 focus:ring-claude-primary focus:ring-opacity-20 focus:outline-none resize-none"
            rows={3}
            placeholder="Décrivez brièvement l'objectif de ce projet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur
          </label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  c.class,
                  color === c.value
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    : 'hover:scale-105'
                )}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Ce projet vous permettra de :
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-claude-primary rounded-full" />
              Uploader jusqu&apos;à 500 Mo de documents
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-claude-primary rounded-full" />
              Analyser des PDF, images et fichiers de données
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-claude-primary rounded-full" />
              Obtenir des réponses avec citations précises
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-claude-primary rounded-full" />
              Conserver l&apos;historique des conversations
            </li>
          </ul>
        </div>
      </form>
    </Modal>
  )
}
