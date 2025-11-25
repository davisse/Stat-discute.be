/**
 * Password Reset Request API Route
 *
 * Initiates password reset flow by generating a secure reset token
 * and storing it in the database with expiration time.
 *
 * Security Features:
 * - Email enumeration prevention (always returns success)
 * - Rate limiting (3 requests per 15 minutes per IP)
 * - UUID token with SHA-256 hashing
 * - 1-hour token expiration
 * - IP address logging for audit trail
 *
 * OWASP ASVS Level 2 Compliance:
 * - V2.1.11: No account existence disclosure
 * - V2.8.1: Rate limiting for password reset
 * - V2.8.2: Secure token generation (cryptographically random)
 *
 * @module api/auth/password-reset/request
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { query } from '@/lib/db'

// ============================================
// REQUEST VALIDATION SCHEMA
// ============================================

const PasswordResetRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Adresse e-mail invalide')
    .max(255, "L'adresse e-mail est trop longue")
})

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

/**
 * Simple in-memory rate limiter
 *
 * Tracks password reset requests by IP address.
 * Limits: 3 requests per 15 minutes per IP.
 *
 * Note: In production, use Redis or similar for distributed rate limiting.
 * This implementation is sufficient for single-instance deployments.
 */
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_MAX_REQUESTS = 3
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Check if IP address has exceeded rate limit
 *
 * @param ip - Client IP address
 * @returns true if rate limit exceeded, false otherwise
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (now > entry.resetAt) {
    // Rate limit window expired, reset counter
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return true
  }

  // Increment counter
  entry.count++
  return false
}

/**
 * Clean up expired rate limit entries (garbage collection)
 * Runs periodically to prevent memory leak
 */
function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000)

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate cryptographically secure reset token
 *
 * Uses UUID v4 for randomness and SHA-256 for storage hashing.
 * The plain token is sent to user, the hash is stored in database.
 *
 * @returns Object with plain token and SHA-256 hash
 */
function generateResetToken(): { token: string; hash: string } {
  // Generate UUID v4 (122 bits of entropy)
  const token = crypto.randomUUID()

  // Hash token with SHA-256 before storing in database
  // This prevents token exposure if database is compromised
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  return { token, hash }
}

// ============================================
// API ROUTE HANDLER
// ============================================

/**
 * POST /api/auth/password-reset/request
 *
 * Initiates password reset flow.
 * Always returns success to prevent email enumeration.
 *
 * Request Body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé."
 * }
 *
 * Rate Limit (429 Too Many Requests):
 * {
 *   "success": false,
 *   "error": "Trop de demandes. Veuillez réessayer dans 15 minutes."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // 1. RATE LIMITING
    // ========================================

    // Extract client IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trop de demandes. Veuillez réessayer dans 15 minutes.'
        },
        { status: 429 }
      )
    }

    // ========================================
    // 2. INPUT VALIDATION
    // ========================================

    const body = await request.json()
    const validation = PasswordResetRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // ========================================
    // 3. USER LOOKUP (with enumeration prevention)
    // ========================================

    // Check if user exists
    const userResult = await query(
      'SELECT user_id, email FROM users WHERE email = $1 AND is_active = true',
      [email]
    )

    // IMPORTANT: Always return success, even if user doesn't exist
    // This prevents attackers from discovering valid email addresses
    if (userResult.rows.length === 0) {
      // User doesn't exist, but return success anyway
      return NextResponse.json(
        {
          success: true,
          message: "Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé."
        },
        { status: 200 }
      )
    }

    const user = userResult.rows[0]

    // ========================================
    // 4. TOKEN GENERATION
    // ========================================

    const { token, hash } = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // ========================================
    // 5. DATABASE STORAGE
    // ========================================

    // Delete any existing unused reset tokens for this user (one token per user policy)
    await query(
      `DELETE FROM password_resets
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.user_id]
    )

    // Insert new reset token
    await query(
      `INSERT INTO password_resets
       (user_id, token_hash, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, hash, expiresAt, ip]
    )

    // ========================================
    // 6. EMAIL SENDING (Future Implementation)
    // ========================================

    // TODO: Phase 3 - Implement email sending via Resend or similar service
    // For now, log the token (DEVELOPMENT ONLY - NEVER IN PRODUCTION)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==============================================')
      console.log('PASSWORD RESET TOKEN (Development Only)')
      console.log('==============================================')
      console.log(`Email: ${email}`)
      console.log(`Token: ${token}`)
      console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`)
      console.log(`Expires: ${expiresAt.toISOString()}`)
      console.log('==============================================\n')
    }

    // ========================================
    // 7. SUCCESS RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message: "Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé."
      },
      { status: 200 }
    )

  } catch (error) {
    // Log error for debugging (but don't expose to client)
    console.error('Password reset request error:', error)

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
