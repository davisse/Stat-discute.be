'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

// ============================================
// PASSWORD STRENGTH VALIDATION
// ============================================

interface PasswordStrength {
  hasMinLength: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
  isValid: boolean
}

function validatePasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 12,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password),
    isValid:
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password),
  }
}

// ============================================
// PASSWORD STRENGTH INDICATOR COMPONENT
// ============================================

function PasswordStrengthIndicator({ strength }: { strength: PasswordStrength }) {
  const requirements = [
    { key: 'hasMinLength', label: 'Au moins 12 caractères', met: strength.hasMinLength },
    { key: 'hasLowercase', label: 'Une lettre minuscule (a-z)', met: strength.hasLowercase },
    { key: 'hasUppercase', label: 'Une lettre majuscule (A-Z)', met: strength.hasUppercase },
    { key: 'hasNumber', label: 'Un chiffre (0-9)', met: strength.hasNumber },
    { key: 'hasSpecial', label: 'Un caractère spécial (!@#$...)', met: strength.hasSpecial },
  ]

  return (
    <div className="space-y-2 mt-3">
      <p className="text-sm font-medium text-gray-300">Critères du mot de passe :</p>
      <ul className="space-y-1.5">
        {requirements.map((req) => (
          <li key={req.key} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-gray-600 flex-shrink-0" />
            )}
            <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================
// SIGNUP PAGE COMPONENT
// ============================================

export default function SignupPage() {
  const { signup, isLoading: authLoading } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password strength calculation (memoized for performance)
  const passwordStrength = useMemo(() => validatePasswordStrength(password), [password])

  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validate password strength before submission
    if (!passwordStrength.isValid) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité')
      return
    }

    setIsSubmitting(true)

    try {
      await signup(email, password, fullName)
      // Redirect handled by AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================

  // Show loading state while checking initial session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-400">
            Rejoignez STAT-DISCUTE dès aujourd'hui
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                maxLength={255}
                autoComplete="name"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                placeholder="Jean Dupont"
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                autoComplete="email"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                placeholder="votre@email.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                placeholder="••••••••••••"
                disabled={isSubmitting}
              />

              {/* Password Strength Indicator (only show if user has started typing) */}
              {password.length > 0 && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="text-sm text-gray-400">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-white hover:underline">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="text-white hover:underline">
                politique de confidentialité
              </Link>
              .
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !passwordStrength.isValid}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-white font-medium hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
