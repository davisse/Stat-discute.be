'use client'

import React from 'react'
import {
  FolderOpen,
  Plus,
  MessageSquare,
  FileText,
  Link2,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { Button } from '../ui'
import { cn, getProjectColorClasses, formatFileSize } from '@/lib/utils'

interface SidebarProps {
  onNewProject: () => void
  onNewConversation: () => void
  activeTab: 'projects' | 'connect' | 'metrics'
  onTabChange: (tab: 'projects' | 'connect' | 'metrics') => void
}

export function Sidebar({
  onNewProject,
  onNewConversation,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const {
    projects,
    activeProjectId,
    activeConversationId,
    setActiveProject,
    setActiveConversation,
  } = useAppStore()

  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(
    new Set()
  )

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const activeProject = projects.find((p) => p.id === activeProjectId)

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Navigation tabs */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => onTabChange('projects')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              activeTab === 'projects'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <FolderOpen className="w-4 h-4" />
            Projets
          </button>
          <button
            onClick={() => onTabChange('connect')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              activeTab === 'connect'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Link2 className="w-4 h-4" />
            Connect
          </button>
          <button
            onClick={() => onTabChange('metrics')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              activeTab === 'metrics'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            KPIs
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'projects' && (
          <div className="p-3">
            <Button
              onClick={onNewProject}
              className="w-full mb-4"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau Projet
            </Button>

            {/* Projects list */}
            <div className="space-y-2">
              {projects.map((project) => {
                const colorClasses = getProjectColorClasses(project.color)
                const isExpanded = expandedProjects.has(project.id)
                const isActive = project.id === activeProjectId

                return (
                  <div key={project.id}>
                    {/* Project header */}
                    <button
                      onClick={() => {
                        setActiveProject(project.id)
                        toggleProjectExpanded(project.id)
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all',
                        isActive
                          ? `${colorClasses.bg} ${colorClasses.border} border`
                          : 'hover:bg-gray-50'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          `bg-project-${project.color}`
                        )}
                        style={{
                          backgroundColor: `var(--color-project-${project.color}, #3B82F6)`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.documents.length} docs ·{' '}
                          {formatFileSize(project.totalSize)}
                        </p>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && isActive && (
                      <div className="ml-6 mt-1 space-y-1">
                        {/* Documents */}
                        {project.documents.length > 0 && (
                          <div className="py-1">
                            <p className="text-xs font-medium text-gray-400 uppercase mb-1 px-2">
                              Documents
                            </p>
                            {project.documents.slice(0, 3).map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <FileText className="w-3 h-3" />
                                <span className="truncate">{doc.name}</span>
                              </div>
                            ))}
                            {project.documents.length > 3 && (
                              <p className="px-2 py-1 text-xs text-gray-400">
                                +{project.documents.length - 3} autres
                              </p>
                            )}
                          </div>
                        )}

                        {/* Conversations */}
                        <div className="py-1">
                          <div className="flex items-center justify-between px-2 mb-1">
                            <p className="text-xs font-medium text-gray-400 uppercase">
                              Conversations
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onNewConversation()
                              }}
                              className="p-0.5 hover:bg-gray-100 rounded"
                            >
                              <Plus className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                          {project.conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveConversation(conv.id)
                              }}
                              className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-all',
                                conv.id === activeConversationId
                                  ? 'bg-claude-light text-claude-secondary'
                                  : 'text-gray-600 hover:bg-gray-50'
                              )}
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="truncate">{conv.title}</span>
                            </button>
                          ))}
                          {project.conversations.length === 0 && (
                            <p className="px-2 py-1 text-xs text-gray-400 italic">
                              Aucune conversation
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {projects.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aucun projet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créez votre premier projet pour commencer
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'connect' && (
          <div className="p-4 text-center text-gray-500">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">Claude Connect</p>
            <p className="text-sm mt-1">
              Connectez vos sources de données
            </p>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="p-4 text-center text-gray-500">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">Métriques KPI</p>
            <p className="text-sm mt-1">
              Tableau de bord des performances
            </p>
          </div>
        )}
      </div>

      {/* Active project info */}
      {activeProject && activeTab === 'projects' && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Projet actif</p>
          <p className="font-medium text-sm text-gray-900 truncate">
            {activeProject.name}
          </p>
        </div>
      )}
    </aside>
  )
}
