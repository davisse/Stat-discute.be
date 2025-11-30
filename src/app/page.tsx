'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store'
import { Header, Sidebar } from '@/components/layout'
import { NewProjectModal, ProjectWorkspace } from '@/components/projects'
import { ChatInterface } from '@/components/chat'
import { DocumentViewer } from '@/components/documents'
import { ClaudeConnect } from '@/components/connect'
import { KPIDashboard } from '@/components/metrics'
import { cn } from '@/lib/utils'
import type { Citation } from '@/types'

export default function Home() {
  const {
    projects,
    activeProjectId,
    activeConversationId,
    documentViewer,
    createConversation,
    openDocumentViewer,
    closeDocumentViewer,
    highlightCitation,
  } = useAppStore()

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'projects' | 'connect' | 'metrics'>('projects')

  // Get active project and conversation
  const activeProject = projects.find((p) => p.id === activeProjectId) || null
  const activeConversation = activeProject?.conversations.find(
    (c) => c.id === activeConversationId
  ) || null

  // Get document for viewer
  const viewerDocument = documentViewer.documentId
    ? activeProject?.documents.find((d) => d.id === documentViewer.documentId)
    : null

  const handleNewConversation = () => {
    if (activeProject) {
      createConversation(
        activeProject.id,
        `Conversation ${activeProject.conversations.length + 1}`
      )
    }
  }

  const handleCitationClick = (citation: Citation) => {
    openDocumentViewer(citation.documentId, citation)
  }

  const handleOpenDocument = (documentId: string) => {
    openDocumentViewer(documentId)
  }

  // Render main content based on state
  const renderMainContent = () => {
    // If metrics tab is active
    if (activeTab === 'metrics') {
      return <KPIDashboard />
    }

    // If connect tab is active
    if (activeTab === 'connect') {
      return <ClaudeConnect projectId={activeProjectId} />
    }

    // No project selected
    if (!activeProject) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-claude-primary to-claude-secondary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue dans Claude Next-Gen
          </h2>
          <p className="text-gray-500 max-w-md mb-6">
            Créez un projet pour commencer à analyser vos documents avec des
            citations précises et une compréhension contextuelle profonde.
          </p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-6 py-3 bg-claude-primary text-white rounded-xl font-medium hover:bg-claude-secondary transition-colors shadow-lg"
          >
            Créer votre premier projet
          </button>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl">
            <FeatureCard
              icon="📚"
              title="Projets Persistants"
              description="Uploadez jusqu'à 500Mo de documents par projet"
            />
            <FeatureCard
              icon="🔍"
              title="Citations Granulaires"
              description="Chaque réponse cite précisément ses sources"
            />
            <FeatureCard
              icon="📊"
              title="Analyse Multimodale"
              description="PDF, images, graphiques et données structurées"
            />
          </div>
        </div>
      )
    }

    // Project selected but no conversation
    if (!activeConversation) {
      return (
        <ProjectWorkspace
          project={activeProject}
          onOpenDocument={handleOpenDocument}
          onStartConversation={handleNewConversation}
        />
      )
    }

    // Active conversation - show chat
    return (
      <ChatInterface
        project={activeProject}
        conversation={activeConversation}
        onCitationClick={handleCitationClick}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onNewProject={() => setShowNewProjectModal(true)}
          onNewConversation={handleNewConversation}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main content */}
        <main
          className={cn(
            'flex-1 flex overflow-hidden bg-white',
            documentViewer.isOpen && 'mr-96'
          )}
        >
          {renderMainContent()}
        </main>

        {/* Document viewer panel */}
        {documentViewer.isOpen && viewerDocument && (
          <aside className="w-96 flex-shrink-0 fixed right-0 top-16 bottom-0">
            <DocumentViewer
              document={viewerDocument}
              onClose={closeDocumentViewer}
            />
          </aside>
        )}
      </div>

      {/* New project modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl text-center">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}
