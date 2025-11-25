'use client'

import { NavLink } from './NavLink'

export function Sidebar() {
  return (
    <aside style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      padding: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '24px'
    }}>
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#111827',
          margin: 0
        }}>
          Admin Panel
        </h1>
        <p style={{
          fontSize: '12px',
          color: '#6B7280',
          margin: '4px 0 0 0'
        }}>
          Data Management
        </p>
      </div>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <NavLink href="/admin" label="Dashboard" />
        <NavLink href="/admin/games" label="Games" />
        <NavLink href="/admin/players" label="Players" />
        <NavLink href="/admin/standings" label="Standings" />
        <NavLink href="/admin/sync" label="Sync Actions" />
      </nav>
    </aside>
  )
}
