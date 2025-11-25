'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Reset Password Page
 *
 * Allows users to set a new password using a reset token from email.
 * Includes real-time password strength validation.
 *
 * Design System Compliance:
 * - Monochrome strict: Only black/white/gray
 * - Background: bg-black with subtle pattern
 * - Mobile-first responsive (max-w-md container)
 * - WCAG 2.1 AA accessibility
 * - French language
 */

interface PasswordStrength {
  hasMinLength: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength>({
    hasMinLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  // Check for token
  React.useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré')
    }
  }, [token])

  // Update password strength on password change
  React.useEffect(() => {
    setPasswordStrength({
      hasMinLength: newPassword.length >= 12,
      hasLowercase: /[a-z]/.test(newPassword),
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    })
  }, [newPassword])

  const isPasswordValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasLowercase &&
    passwordStrength.hasUppercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecial

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!token) {
      setError('Lien de réinitialisation invalide')
      return
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité')
      return
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation du mot de passe')
      }

      // Success - redirect to login with success message
      router.push('/login?reset=success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[var(--space-4)] bg-black">
      <div className="w-full max-w-md space-y-[var(--space-6)]">
        {/* Header */}
        <div className="text-center space-y-[var(--space-3)]">
          <h1
            className="text-[var(--text-3xl)] font-[var(--font-bold)] text-white"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Nouveau mot de passe
          </h1>
          <p
            className="text-[var(--text-base)] text-[var(--color-gray-400)]"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Choisissez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Form Card */}
        <Card variant="anthracite" padding="lg">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-[var(--space-6)]" noValidate>
              {/* New Password Field */}
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor="newPassword"
                  className="block text-[var(--text-sm)] font-medium text-white"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading || !token}
                    className="w-full px-[var(--space-4)] py-[var(--space-3)] pr-12 bg-[var(--color-gray-950)] border border-[var(--color-gray-800)] rounded-[var(--radius-md)] text-white placeholder:text-[var(--color-gray-500)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[var(--transition-fast)]"
                    placeholder="Minimum 12 caractères"
                    aria-describedby="password-requirements"
                    style={{ fontFamily: 'var(--font-family-sans)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-500)] hover:text-white transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3l18 18M10.5 10.677a2 2 0 102.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 2.991 5.282 6 9 6 1.55 0 3.043-.523 4.395-1.575M12 6c4.008 0 6.701 3.158 9 6a15.66 15.66 0 01-1.668 2.065"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 12s2.5-5 9-5 9 5 9 5-2.5 5-9 5-9-5-9-5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                <div
                  id="password-requirements"
                  className="space-y-[var(--space-2)] mt-[var(--space-3)]"
                  aria-live="polite"
                >
                  <PasswordCriterion
                    met={passwordStrength.hasMinLength}
                    label="Au moins 12 caractères"
                  />
                  <PasswordCriterion
                    met={passwordStrength.hasLowercase}
                    label="Une lettre minuscule"
                  />
                  <PasswordCriterion
                    met={passwordStrength.hasUppercase}
                    label="Une lettre majuscule"
                  />
                  <PasswordCriterion met={passwordStrength.hasNumber} label="Un chiffre" />
                  <PasswordCriterion
                    met={passwordStrength.hasSpecial}
                    label="Un caractère spécial (!@#$%...)"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[var(--text-sm)] font-medium text-white"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !token}
                  className="w-full px-[var(--space-4)] py-[var(--space-3)] bg-[var(--color-gray-950)] border border-[var(--color-gray-800)] rounded-[var(--radius-md)] text-white placeholder:text-[var(--color-gray-500)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[var(--transition-fast)]"
                  placeholder="Retapez votre mot de passe"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                />
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-2)]">
                    {passwordsMatch ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[var(--text-xs)] text-white">
                          Les mots de passe correspondent
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-[var(--color-gray-500)]"
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[var(--text-xs)] text-[var(--color-gray-500)]">
                          Les mots de passe ne correspondent pas
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="px-[var(--space-4)] py-[var(--space-3)] bg-[var(--color-gray-900)] border border-[var(--color-gray-800)] rounded-[var(--radius-md)] text-[var(--text-sm)] text-white"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={!token || !isPasswordValid || !passwordsMatch || isLoading}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-[var(--text-sm)] text-[var(--color-gray-400)] hover:text-white transition-colors duration-[var(--transition-fast)] underline"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * PasswordCriterion Component
 * Visual indicator for password strength requirements
 */
interface PasswordCriterionProps {
  met: boolean
  label: string
}

function PasswordCriterion({ met, label }: PasswordCriterionProps) {
  return (
    <div className="flex items-center gap-[var(--space-2)]">
      {met ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white flex-shrink-0"
          aria-hidden="true"
        >
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--color-gray-700)] flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
      <span
        className={`text-[var(--text-xs)] ${met ? 'text-white' : 'text-[var(--color-gray-500)]'}`}
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {label}
      </span>
    </div>
  )
}
