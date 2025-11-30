'use client'

import React, { useState } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Plus,
  MessageSquare,
  Clock,
  HardDrive,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { Button, Card, CardContent, Progress, Badge } from '../ui'
import { cn, formatFileSize, formatDate, getProjectColorClasses, MAX_PROJECT_SIZE, getProjectSizePercentage } from '@/lib/utils'
import { DocumentUploader } from '../documents/DocumentUploader'
import type { Project } from '@/types'

interface ProjectWorkspaceProps {
  project: Project
  onOpenDocument: (documentId: string) => void
  onStartConversation: () => void
}

export function ProjectWorkspace({
  project,
  onOpenDocument,
  onStartConversation,
}: ProjectWorkspaceProps) {
  const { removeDocument } = useAppStore()
  const [showUploader, setShowUploader] = useState(false)
  const colorClasses = getProjectColorClasses(project.color)
  const sizePercentage = getProjectSizePercentage(project.totalSize)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  'w-4 h-4 rounded-full',
                  `bg-project-${project.color}`
                )}
                style={{
                  backgroundColor:
                    project.color === 'blue'
                      ? '#3B82F6'
                      : project.color === 'green'
                      ? '#10B981'
                      : project.color === 'purple'
                      ? '#8B5CF6'
                      : project.color === 'pink'
                      ? '#EC4899'
                      : '#F97316',
                }}
              />
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            </div>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUploader(true)}
            >
              <Upload className="w-4 h-4" />
              Uploader
            </Button>
            <Button size="sm" onClick={onStartConversation}>
              <MessageSquare className="w-4 h-4" />
              Nouvelle conversation
            </Button>
          </div>
        </div>

        {/* Project stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {project.documents.length}
                </p>
                <p className="text-sm text-gray-500">Documents</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {project.conversations.length}
                </p>
                <p className="text-sm text-gray-500">Conversations</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(project.totalSize)}
                </p>
                <p className="text-sm text-gray-500">Stockage utilisé</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(project.updatedAt)}
                </p>
                <p className="text-sm text-gray-500">Dernière mise à jour</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Storage progress */}
        <div className="mb-6">
          <Progress
            value={project.totalSize}
            max={MAX_PROJECT_SIZE}
            showLabel
            label={`Stockage: ${formatFileSize(project.totalSize)} / ${formatFileSize(MAX_PROJECT_SIZE)}`}
            variant={sizePercentage > 90 ? 'danger' : sizePercentage > 70 ? 'warning' : 'default'}
          />
        </div>
      </div>

      {/* Documents section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUploader(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>

        {project.documents.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {project.documents.map((doc) => (
              <Card
                key={doc.id}
                variant="bordered"
                className="hover:shadow-md transition-shadow cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        doc.type === 'pdf'
                          ? 'bg-red-100'
                          : doc.type === 'image'
                          ? 'bg-blue-100'
                          : doc.type === 'csv'
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      )}
                    >
                      <FileText
                        className={cn(
                          'w-5 h-5',
                          doc.type === 'pdf'
                            ? 'text-red-600'
                            : doc.type === 'image'
                            ? 'text-blue-600'
                            : doc.type === 'csv'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm">{doc.type.toUpperCase()}</Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDocument(doc.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(project.id, doc.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="p-8 text-center">
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Aucun document dans ce projet</p>
            <p className="text-sm text-gray-400 mb-4">
              Uploadez des PDF, images ou fichiers de données pour commencer
              l&apos;analyse
            </p>
            <Button size="sm" onClick={() => setShowUploader(true)}>
              <Upload className="w-4 h-4" />
              Uploader des documents
            </Button>
          </Card>
        )}
      </div>

      {/* Recent conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversations récentes
          </h3>
          <Button variant="ghost" size="sm" onClick={onStartConversation}>
            <Plus className="w-4 h-4" />
            Nouvelle
          </Button>
        </div>

        {project.conversations.length > 0 ? (
          <div className="space-y-2">
            {project.conversations.map((conv) => (
              <Card
                key={conv.id}
                variant="bordered"
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-claude-light rounded-lg">
                    <MessageSquare className="w-5 h-5 text-claude-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{conv.title}</p>
                    <p className="text-sm text-gray-500">
                      {conv.messages.length} messages · {formatDate(conv.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Aucune conversation</p>
            <p className="text-sm text-gray-400 mb-4">
              Démarrez une conversation pour analyser vos documents avec Claude
            </p>
            <Button size="sm" onClick={onStartConversation}>
              <MessageSquare className="w-4 h-4" />
              Commencer
            </Button>
          </Card>
        )}
      </div>

      {/* Document uploader modal */}
      <DocumentUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        projectId={project.id}
      />
    </div>
  )
}
