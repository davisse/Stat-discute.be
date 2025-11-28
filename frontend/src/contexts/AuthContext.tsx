'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
  id: number
  email: string
  fullName: string
  role: 'user' | 'premium' | 'admin'
  emailVerified?: boolean
  createdAt?: string
  lastLoginAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

interface SessionResponse {
  authenticated: boolean
  user: User | null
  requiresRefresh?: boolean
  error?: string
}

interface LoginResponse {
  success: boolean
  user: User
  sessionId: string
}

interface SignupResponse {
  success: boolean
  user: User
  message: string
}

interface ErrorResponse {
  error: string
  details?: string[] | Record<string, string>
  retryAfter?: string
  attemptsLeft?: number
  lockedUntil?: string
  reason?: string
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ============================================
  // CHECK SESSION ON MOUNT
  // ============================================

  const checkSession = useCallback(async (attemptRefresh = true) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })

      const data: SessionResponse = await response.json()

      // If token expired and we should try to refresh
      if (!response.ok && data.requiresRefresh && attemptRefresh) {
        // Try to refresh the token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (refreshResponse.ok) {
          // Token refreshed successfully, check session again (without refresh attempt to avoid loop)
          return checkSession(false)
        }
      }

      if (!response.ok) {
        setUser(null)
        setIsLoading(false)
        return
      }

      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // ============================================
  // AUTO-REFRESH TOKEN EVERY 14 MINUTES
  // ============================================

  useEffect(() => {
    if (!user) return

    // Set up auto-refresh interval (14 minutes = 840000ms)
    // Access token expires after 15 minutes, refresh at 14 to be safe
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          console.error('Auto-refresh failed, logging out')
          setUser(null)
          router.push('/login')
          clearInterval(refreshInterval)
        }
      } catch (error) {
        console.error('Auto-refresh error:', error)
        setUser(null)
        router.push('/login')
        clearInterval(refreshInterval)
      }
    }, 14 * 60 * 1000) // 14 minutes

    return () => clearInterval(refreshInterval)
  }, [user, router])

  // ============================================
  // LOGIN METHOD
  // ============================================

  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json()
      throw new Error(errorData.error || 'Échec de la connexion')
    }

    const data: LoginResponse = await response.json()

    if (data.success && data.user) {
      setUser(data.user)
      router.push('/') // Redirect to home after successful login
    } else {
      throw new Error('Réponse de connexion invalide')
    }
  }

  // ============================================
  // SIGNUP METHOD
  // ============================================

  const signup = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, fullName }),
    })

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json()

      // Handle validation errors (details object)
      if (errorData.details && typeof errorData.details === 'object') {
        const firstError = Object.values(errorData.details)[0]
        throw new Error(firstError || errorData.error)
      }

      throw new Error(errorData.error || 'Échec de l\'inscription')
    }

    const data: SignupResponse = await response.json()

    if (data.success && data.user) {
      setUser(data.user)
      router.push('/') // Redirect to home after successful signup
    } else {
      throw new Error('Réponse d\'inscription invalide')
    }
  }

  // ============================================
  // LOGOUT METHOD
  // ============================================

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  // ============================================
  // MANUAL REFRESH SESSION METHOD
  // ============================================

  const refreshSession = async (): Promise<void> => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Échec du rafraîchissement de la session')
    }

    // After successful refresh, check session again
    await checkSession()
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================
// CUSTOM HOOK FOR USING AUTH CONTEXT
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
