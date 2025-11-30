import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  Project,
  Document,
  Conversation,
  Message,
  Citation,
  ConnectedSource,
  DocumentViewerState,
  KPIMetrics,
  ProjectColor
} from '@/types'

interface AppState {
  // Projects
  projects: Project[]
  activeProjectId: string | null

  // Conversations
  activeConversationId: string | null

  // Document Viewer (E2)
  documentViewer: DocumentViewerState

  // KPIs
  kpiMetrics: KPIMetrics

  // Actions - Projects
  createProject: (name: string, description: string, color: ProjectColor) => Project
  deleteProject: (projectId: string) => void
  setActiveProject: (projectId: string | null) => void

  // Actions - Documents
  addDocument: (projectId: string, document: Omit<Document, 'id' | 'uploadedAt'>) => Document
  removeDocument: (projectId: string, documentId: string) => void

  // Actions - Conversations
  createConversation: (projectId: string, title: string) => Conversation
  setActiveConversation: (conversationId: string | null) => void
  addMessage: (projectId: string, conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message

  // Actions - Document Viewer
  openDocumentViewer: (documentId: string, citation?: Citation) => void
  closeDocumentViewer: () => void
  highlightCitation: (citation: Citation | null) => void

  // Actions - Connected Sources (D2)
  addConnectedSource: (projectId: string, source: Omit<ConnectedSource, 'id'>) => void
  removeConnectedSource: (projectId: string, sourceId: string) => void

  // Helpers
  getActiveProject: () => Project | null
  getActiveConversation: () => Conversation | null
}

// Sample KPI metrics (for demo)
const initialKPIMetrics: KPIMetrics = {
  benchmarkScores: {
    mmlu: 92.3,
    gpqa: 67.8,
    humanEval: 89.5,
  },
  hallucinationRate: 0.8,
  longContextUsage: 42,
  proRetention: 87,
  functionCallingGrowth: 156,
  avgTTFT: 245,
  availability: 99.95,
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  projects: [],
  activeProjectId: null,
  activeConversationId: null,
  documentViewer: {
    isOpen: false,
    documentId: null,
    highlightedCitation: null,
  },
  kpiMetrics: initialKPIMetrics,

  // Project Actions
  createProject: (name, description, color) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      color,
      documents: [],
      conversations: [],
      connectedSources: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalSize: 0,
    }

    set(state => ({
      projects: [...state.projects, newProject],
      activeProjectId: newProject.id,
    }))

    return newProject
  },

  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId),
      activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
    }))
  },

  setActiveProject: (projectId) => {
    set({ activeProjectId: projectId, activeConversationId: null })
  },

  // Document Actions
  addDocument: (projectId, documentData) => {
    const newDocument: Document = {
      ...documentData,
      id: uuidv4(),
      uploadedAt: new Date(),
    }

    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            documents: [...p.documents, newDocument],
            totalSize: p.totalSize + newDocument.size,
            updatedAt: new Date(),
          }
        }
        return p
      }),
    }))

    return newDocument
  },

  removeDocument: (projectId, documentId) => {
    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          const doc = p.documents.find(d => d.id === documentId)
          return {
            ...p,
            documents: p.documents.filter(d => d.id !== documentId),
            totalSize: p.totalSize - (doc?.size || 0),
            updatedAt: new Date(),
          }
        }
        return p
      }),
    }))
  },

  // Conversation Actions
  createConversation: (projectId, title) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            conversations: [...p.conversations, newConversation],
            updatedAt: new Date(),
          }
        }
        return p
      }),
      activeConversationId: newConversation.id,
    }))

    return newConversation
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId })
  },

  addMessage: (projectId, conversationId, messageData) => {
    const newMessage: Message = {
      ...messageData,
      id: uuidv4(),
      timestamp: new Date(),
    }

    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            conversations: p.conversations.map(c => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: new Date(),
                }
              }
              return c
            }),
            updatedAt: new Date(),
          }
        }
        return p
      }),
    }))

    return newMessage
  },

  // Document Viewer Actions
  openDocumentViewer: (documentId, citation) => {
    set({
      documentViewer: {
        isOpen: true,
        documentId,
        highlightedCitation: citation || null,
      },
    })
  },

  closeDocumentViewer: () => {
    set({
      documentViewer: {
        isOpen: false,
        documentId: null,
        highlightedCitation: null,
      },
    })
  },

  highlightCitation: (citation) => {
    set(state => ({
      documentViewer: {
        ...state.documentViewer,
        highlightedCitation: citation,
      },
    }))
  },

  // Connected Sources Actions
  addConnectedSource: (projectId, sourceData) => {
    const newSource: ConnectedSource = {
      ...sourceData,
      id: uuidv4(),
    }

    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            connectedSources: [...p.connectedSources, newSource],
            updatedAt: new Date(),
          }
        }
        return p
      }),
    }))
  },

  removeConnectedSource: (projectId, sourceId) => {
    set(state => ({
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            connectedSources: p.connectedSources.filter(s => s.id !== sourceId),
            updatedAt: new Date(),
          }
        }
        return p
      }),
    }))
  },

  // Helpers
  getActiveProject: () => {
    const state = get()
    return state.projects.find(p => p.id === state.activeProjectId) || null
  },

  getActiveConversation: () => {
    const state = get()
    const project = state.getActiveProject()
    if (!project) return null
    return project.conversations.find(c => c.id === state.activeConversationId) || null
  },
}))
