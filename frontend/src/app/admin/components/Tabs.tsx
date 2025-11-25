'use client'

import { ReactNode, useState } from 'react'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#FAFAFA',
        borderBottom: '1px solid #E5E7EB'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#111827' : '#6B7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px' }}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
