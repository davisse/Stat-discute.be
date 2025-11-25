'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Forgot Password Page
 *
 * Allows users to request a password reset email.
 * Always shows success message after submission (security best practice).
 *
 * Design System Compliance:
 * - Monochrome strict: Only black/white/gray
 * - Background: bg-black with subtle pattern
 * - Mobile-first responsive (max-w-md container)
 * - WCAG 2.1 AA accessibility
 * - French language
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Always show success message (security best practice)
      setIsSubmitted(true)
    } catch (err) {
      // Even on error, show success message for security
      // (don't reveal if email exists in database)
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-[var(--space-4)] bg-black">
        <div className="w-full max-w-md space-y-[var(--space-6)]">
          {/* Success Message */}
          <Card variant="anthracite" padding="lg">
            <CardHeader>
              <div className="mb-[var(--space-4)] flex justify-center">
                <div
                  className="h-12 w-12 rounded-full bg-[var(--color-gray-900)] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    width="24"
                    height="24"
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
                </div>
              </div>
              <CardTitle className="text-center">Email envoyé</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-[var(--text-base)] leading-[var(--leading-relaxed)] mb-[var(--space-6)]">
                Si un compte existe avec l'adresse <strong className="text-white">{email}</strong>,
                vous recevrez un email contenant les instructions pour réinitialiser votre mot de
                passe.
              </CardDescription>
              <CardDescription className="text-center text-[var(--text-sm)] text-[var(--color-gray-500)] mb-[var(--space-6)]">
                Vérifiez également votre dossier spam si vous ne voyez pas l'email dans votre
                boîte de réception.
              </CardDescription>
              <Link href="/login" className="block">
                <Button variant="secondary" fullWidth>
                  Retour à la connexion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            Mot de passe oublié
          </h1>
          <p
            className="text-[var(--text-base)] text-[var(--color-gray-400)]"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form Card */}
        <Card variant="anthracite" padding="lg">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-[var(--space-6)]" noValidate>
              {/* Email Field */}
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor="email"
                  className="block text-[var(--text-sm)] font-medium text-white"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                >
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-[var(--space-4)] py-[var(--space-3)] bg-[var(--color-gray-950)] border border-[var(--color-gray-800)] rounded-[var(--radius-md)] text-white placeholder:text-[var(--color-gray-500)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[var(--transition-fast)]"
                  placeholder="votre.email@exemple.com"
                  aria-describedby="email-description"
                  aria-invalid={error ? 'true' : 'false'}
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                />
                <p
                  id="email-description"
                  className="text-[var(--text-xs)] text-[var(--color-gray-500)]"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                >
                  Nous vous enverrons un lien de réinitialisation sécurisé
                </p>
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
              <Button type="submit" variant="primary" fullWidth loading={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
