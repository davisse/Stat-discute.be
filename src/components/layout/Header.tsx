'use client'

import React from 'react'
import { Sparkles, Settings, HelpCircle, Bell } from 'lucide-react'
import { Button } from '../ui'

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-claude-primary to-claude-secondary rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Claude Next-Gen</h1>
          <p className="text-xs text-gray-500">Project Alexandria</p>
        </div>
      </div>

      {/* Center - Model indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-claude-light rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-claude-secondary">Opus Next</span>
        <span className="text-xs text-gray-500">| 200K contexte</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </Button>
        <Button variant="ghost" size="sm">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium ml-2">
          U
        </div>
      </div>
    </header>
  )
}
