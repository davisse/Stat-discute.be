'use client'

import React, { useState } from 'react'
import {
  Link2,
  Cloud,
  FileText,
  Github,
  RefreshCw,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { Button, Card, CardContent, Badge, Modal } from '../ui'
import { cn, formatDate } from '@/lib/utils'
import type { SourceType, ConnectedSource } from '@/types'

const SOURCE_CONFIGS: Record<
  SourceType,
  {
    name: string
    icon: React.ElementType
    color: string
    description: string
  }
> = {
  'google-drive': {
    name: 'Google Drive',
    icon: Cloud,
    color: 'text-blue-600 bg-blue-100',
    description: 'Connectez vos documents Google Docs, Sheets et Slides',
  },
  notion: {
    name: 'Notion',
    icon: FileText,
    color: 'text-gray-900 bg-gray-100',
    description: 'Synchronisez vos pages et bases de données Notion',
  },
  dropbox: {
    name: 'Dropbox',
    icon: Cloud,
    color: 'text-blue-500 bg-blue-100',
    description: 'Accédez à vos fichiers Dropbox',
  },
  onedrive: {
    name: 'OneDrive',
    icon: Cloud,
    color: 'text-sky-600 bg-sky-100',
    description: 'Connectez votre stockage Microsoft OneDrive',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'text-gray-900 bg-gray-100',
    description: 'Analysez vos repositories et documentation',
  },
}

interface ClaudeConnectProps {
  projectId: string | null
}

export function ClaudeConnect({ projectId }: ClaudeConnectProps) {
  const { projects, addConnectedSource, removeConnectedSource } = useAppStore()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const activeProject = projectId
    ? projects.find((p) => p.id === projectId)
    : null

  const handleConnect = async (sourceType: SourceType) => {
    if (!projectId) return

    setIsConnecting(true)
    setSelectedSource(sourceType)

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000))

    addConnectedSource(projectId, {
      type: sourceType,
      name: SOURCE_CONFIGS[sourceType].name,
      status: 'connected',
      lastSynced: new Date(),
      documentsCount: Math.floor(Math.random() * 50) + 10,
    })

    setIsConnecting(false)
    setShowConnectModal(false)
    setSelectedSource(null)
  }

  const handleDisconnect = (sourceId: string) => {
    if (!projectId) return
    removeConnectedSource(projectId, sourceId)
  }

  const handleSync = async (source: ConnectedSource) => {
    // Simulate sync
    console.log('Syncing', source.name)
  }

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Link2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Claude Connect
        </h3>
        <p className="text-gray-500 max-w-md mb-6">
          Sélectionnez un projet pour connecter des sources de données externes
          en lecture seule.
        </p>
        <Badge variant="info">Fonctionnalité Beta</Badge>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Claude Connect</h2>
            <p className="text-gray-500">
              Connectez vos sources de données au projet{' '}
              <strong>{activeProject.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="info">Beta</Badge>
          <Badge variant="success">
            <Lock className="w-3 h-3 mr-1" />
            Lecture seule
          </Badge>
        </div>
      </div>

      {/* Security notice */}
      <Card variant="bordered" className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">
              Accès sécurisé en lecture seule
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Claude Connect n&apos;accède à vos données qu&apos;en lecture.
              Aucune modification, suppression ou partage de vos fichiers n&apos;est
              possible. Vos données ne sont jamais utilisées pour l&apos;entraînement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Connected sources */}
      {activeProject.connectedSources.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sources connectées
          </h3>
          <div className="space-y-3">
            {activeProject.connectedSources.map((source) => {
              const config = SOURCE_CONFIGS[source.type]
              const Icon = config.icon

              return (
                <Card key={source.id} variant="bordered">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn('p-3 rounded-lg', config.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {source.name}
                        </h4>
                        <Badge
                          variant={
                            source.status === 'connected'
                              ? 'success'
                              : source.status === 'syncing'
                              ? 'warning'
                              : 'error'
                          }
                          size="sm"
                        >
                          {source.status === 'connected' && (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {source.status === 'syncing' && (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          {source.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {source.documentsCount} documents ·{' '}
                        {source.lastSynced && (
                          <>Sync: {formatDate(source.lastSynced)}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSync(source)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(source.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available sources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ajouter une source
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(SOURCE_CONFIGS) as [SourceType, typeof SOURCE_CONFIGS[SourceType]][]).map(
            ([type, config]) => {
              const Icon = config.icon
              const isConnected = activeProject.connectedSources.some(
                (s) => s.type === type
              )

              return (
                <Card
                  key={type}
                  variant="bordered"
                  className={cn(
                    'cursor-pointer transition-all',
                    isConnected
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md hover:border-gray-300'
                  )}
                  onClick={() => !isConnected && handleConnect(type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg', config.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {config.name}
                          </h4>
                          {isConnected && (
                            <Badge variant="success" size="sm">
                              Connecté
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {config.description}
                        </p>
                      </div>
                      {!isConnected && (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      </div>

      {/* Connecting modal */}
      <Modal
        isOpen={isConnecting}
        onClose={() => {}}
        title="Connexion en cours..."
        size="sm"
      >
        <div className="text-center py-8">
          <RefreshCw className="w-12 h-12 text-claude-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">
            Connexion à {selectedSource && SOURCE_CONFIGS[selectedSource].name}
            ...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Veuillez autoriser l&apos;accès dans la fenêtre qui s&apos;ouvre
          </p>
        </div>
      </Modal>
    </div>
  )
}
