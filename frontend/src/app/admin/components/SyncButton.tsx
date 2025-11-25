'use client'

import { useState } from 'react'

interface SyncButtonProps {
  label: string
  endpoint: string
  onSuccess?: () => void
}

export function SyncButton({ label, endpoint, onSuccess }: SyncButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleClick = async () => {
    if (!confirm(`Confirm: ${label}?`)) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setMessage('✓ Success')
        setMessageType('success')
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 1000)
        }
      } else {
        setMessage('✗ Error: ' + (data.message || 'Unknown error'))
        setMessageType('error')
      }
    } catch (error) {
      setMessage('✗ Network error')
      setMessageType('error')
    } finally {
      setLoading(false)
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#E5E7EB' : '#111827',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: loading ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#1F2937'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#111827'
          }
        }}
      >
        {loading ? 'Processing...' : label}
      </button>
      {message && (
        <span
          style={{
            fontSize: '12px',
            color: messageType === 'success' ? '#10B981' : '#EF4444',
            fontWeight: '500'
          }}
        >
          {message}
        </span>
      )}
    </div>
  )
}
