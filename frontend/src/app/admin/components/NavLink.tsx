'use client'

import Link from 'next/link'

interface NavLinkProps {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        textDecoration: 'none',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F9FAFB'
        e.currentTarget.style.color = '#111827'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = '#374151'
      }}
    >
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#9CA3AF'
      }} />
      {label}
    </Link>
  )
}
