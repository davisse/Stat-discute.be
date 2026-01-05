/**
 * Password Reset Confirmation API Route
 *
 * Completes password reset flow by validating token and updating user password.
 * Includes comprehensive security checks and automatic session revocation.
 *
 * Security Features:
 * - Token validation (existence, expiry, single-use)
 * - Password strength validation (OWASP requirements)
 * - Breach database checking (HaveIBeenPwned)
 * - Argon2id password hashing
 * - Automatic session revocation (force re-login)
 * - Audit trail with password change timestamp
 *
 * OWASP ASVS Level 2 Compliance:
 * - V2.8.3: One-time use reset tokens
 * - V2.8.4: Reset token expiration (1 hour)
 * - V2.1.1: Strong password requirements
 * - V2.1.7: Password breach checking
 * - V3.3.3: Session invalidation on password change
 *
 * @module api/auth/password-reset/confirm
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { query } from '@/lib/db'
import {
  hashPassword,
  validatePasswordStrength,
  isPasswordBreached
} from '@/lib/auth/password'

// ============================================
// REQUEST VALIDATION SCHEMA
// ============================================

const PasswordResetConfirmSchema = z.object({
  token: z
    .string()
    .trim()
    .uuid('Jeton de réinitialisation invalide'),

  password: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(128, 'Le mot de passe est trop long (maximum 128 caractères)')
})

// ============================================
// TOKEN VALIDATION
// ============================================

/**
 * Validate reset token against database
 *
 * Checks:
 * 1. Token exists in database
 * 2. Token hasn't been used yet
 * 3. Token hasn't expired
 *
 * @param token - Plain UUID token from user
 * @returns User ID if valid, null otherwise
 */
async function validateResetToken(token: string): Promise<number | null> {
  // Hash token to match stored hash
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  // Query database for matching token
  const result = await query(
    `SELECT user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = $1`,
    [tokenHash]
  )

  if (result.rows.length === 0) {
    // Token doesn't exist
    return null
  }

  const resetRecord = result.rows[0]

  // Check if token has been used
  if (resetRecord.used_at !== null) {
    return null
  }

  // Check if token has expired
  const now = new Date()
  const expiresAt = new Date(resetRecord.expires_at)

  if (now > expiresAt) {
    return null
  }

  // Token is valid
  return resetRecord.user_id
}

/**
 * Mark reset token as used in database
 *
 * Prevents token reuse attacks.
 * Sets used_at timestamp to current time.
 *
 * @param token - Plain UUID token
 */
async function markTokenAsUsed(token: string): Promise<void> {
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  await query(
    `UPDATE password_resets
     SET used_at = NOW()
     WHERE token_hash = $1`,
    [tokenHash]
  )
}

// ============================================
// SESSION REVOCATION
// ============================================

/**
 * Revoke all active sessions for a user
 *
 * Forces user to re-login after password change.
 * Implements OWASP requirement: invalidate all sessions on credential change.
 *
 * @param userId - User ID to revoke sessions for
 */
async function revokeAllUserSessions(userId: number): Promise<void> {
  await query(
    `UPDATE sessions
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [userId]
  )
}

// ============================================
// API ROUTE HANDLER
// ============================================

/**
 * POST /api/auth/password-reset/confirm
 *
 * Confirms password reset and updates user password.
 * Validates token, checks password strength and breach status,
 * then updates password and revokes all sessions.
 *
 * Request Body:
 * {
 *   "token": "550e8400-e29b-41d4-a716-446655440000",
 *   "password": "NewSecureP@ssw0rd123!"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Votre mot de passe a été réinitialisé avec succès."
 * }
 *
 * Error Responses:
 * - 400: Invalid input or token
 * - 422: Weak password or breached password
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // 1. INPUT VALIDATION
    // ========================================

    const body = await request.json()
    const validation = PasswordResetConfirmSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message
        },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // ========================================
    // 2. TOKEN VALIDATION
    // ========================================

    const userId = await validateResetToken(token)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Jeton de réinitialisation invalide, expiré ou déjà utilisé.'
        },
        { status: 400 }
      )
    }

    // ========================================
    // 3. PASSWORD STRENGTH VALIDATION
    // ========================================

    const strengthValidation = validatePasswordStrength(password)

    if (!strengthValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mot de passe trop faible',
          details: strengthValidation.errors
        },
        { status: 422 }
      )
    }

    // ========================================
    // 4. BREACH DATABASE CHECK
    // ========================================

    const isBreached = await isPasswordBreached(password)

    if (isBreached) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.'
        },
        { status: 422 }
      )
    }

    // ========================================
    // 5. PASSWORD HASHING
    // ========================================

    const passwordHash = await hashPassword(password)

    // ========================================
    // 6. DATABASE UPDATE (Transaction)
    // ========================================

    // Start transaction to ensure atomicity
    // All operations must succeed or all fail
    await query('BEGIN')

    try {
      // Update user password
      await query(
        `UPDATE users
         SET password_hash = $1,
             password_changed_at = NOW()
         WHERE user_id = $2`,
        [passwordHash, userId]
      )

      // Mark token as used (prevent reuse)
      await markTokenAsUsed(token)

      // Revoke all active sessions (force re-login)
      await revokeAllUserSessions(userId)

      // Commit transaction
      await query('COMMIT')

    } catch (transactionError) {
      // Rollback on any error
      await query('ROLLBACK')
      throw transactionError
    }

    // ========================================
    // 7. SUCCESS RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès.'
      },
      { status: 200 }
    )

  } catch (error) {
    // Log error for debugging (but don't expose to client)
    console.error('Password reset confirmation error:', error)

    // Return generic error message (prevent information leakage)
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
      },
      { status: 500 }
    )
  }
}

// ============================================
// CLEANUP UTILITIES
// ============================================

/**
 * Cleanup expired reset tokens
 *
 * Should be run periodically (e.g., daily cron job).
 * Removes reset tokens that have expired or been used.
 *
 * This is an administrative function, not exposed as an API endpoint.
 * Run via scheduled task or database trigger.
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await query(
    `DELETE FROM password_resets
     WHERE expires_at < NOW()
        OR used_at IS NOT NULL`,
    []
  )

  return result.rowCount || 0
}
