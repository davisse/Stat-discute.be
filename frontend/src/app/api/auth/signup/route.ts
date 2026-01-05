/**
 * User Registration API Route
 *
 * POST /api/auth/signup
 *
 * Implements secure user registration with:
 * - Zod input validation
 * - Argon2id password hashing
 * - HaveIBeenPwned breach checking
 * - JWT token generation
 * - Session management with device fingerprinting
 * - Comprehensive error handling
 *
 * Security measures:
 * - Password strength validation (12+ chars, mixed case, numbers, special chars)
 * - Email uniqueness check (409 Conflict)
 * - Breach database verification
 * - httpOnly cookies (SameSite=Lax, Secure in production)
 * - Parameterized SQL queries (SQL injection prevention)
 *
 * @module api/auth/signup
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
import {
  generateAccessToken,
  generateRefreshToken
} from '@/lib/auth/jwt'

// ============================================
// INPUT VALIDATION SCHEMA
// ============================================

/**
 * Signup request validation schema
 *
 * Requirements:
 * - email: Valid email format, lowercase, max 255 chars
 * - password: Min 12 chars (validated separately with validatePasswordStrength)
 * - fullName: 2-255 characters
 */
const signupSchema = z.object({
  email: z
    .string()
    .email('Format d\'email invalide')
    .toLowerCase()
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),

  password: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères'),

  fullName: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(255, 'Le nom complet ne peut pas dépasser 255 caractères')
    .trim()
})

// ============================================
// TYPE DEFINITIONS
// ============================================

interface SignupRequestBody {
  email: string
  password: string
  fullName: string
}

interface SignupSuccessResponse {
  success: true
  user: {
    id: number
    email: string
    fullName: string
    role: 'user' | 'premium' | 'admin'
  }
  message: string
}

interface SignupErrorResponse {
  error: string
  details?: string[] | Record<string, string>
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate device fingerprint from request headers
 *
 * Creates a SHA-256 hash of:
 * - User-Agent
 * - Accept-Language
 * - Accept-Encoding
 *
 * Used for session security (detect session hijacking)
 *
 * @param request - NextRequest object
 * @returns SHA-256 hash of device signature
 */
function generateDeviceFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || ''
  ].join('|')

  return crypto.createHash('sha256').update(components).digest('hex')
}

/**
 * Get client IP address from request
 *
 * Checks multiple headers in order of preference:
 * 1. x-forwarded-for (proxy/load balancer)
 * 2. x-real-ip (nginx)
 * 3. request.ip (direct connection)
 *
 * @param request - NextRequest object
 * @returns IP address string or 'unknown'
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - NextRequest.ip was removed in Next.js 16
  return 'unknown'
}

// ============================================
// API ROUTE HANDLER
// ============================================

/**
 * POST /api/auth/signup
 *
 * Register a new user account
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecureP@ssw0rd123!",
 *   "fullName": "John Doe"
 * }
 *
 * Success response (201):
 * {
 *   "success": true,
 *   "user": {
 *     "id": 123,
 *     "email": "user@example.com",
 *     "fullName": "John Doe",
 *     "role": "user"
 *   },
 *   "message": "Compte créé avec succès"
 * }
 *
 * Error responses:
 * - 400: Validation errors
 * - 409: Email already exists
 * - 500: Server error
 *
 * Sets httpOnly cookies:
 * - accessToken: 15-minute JWT
 * - refreshToken: 7-day JWT
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // STEP 1: Parse and validate input
    // ============================================

    let body: SignupRequestBody

    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json<SignupErrorResponse>(
        {
          error: 'Corps de la requête invalide',
          details: { body: 'Le corps de la requête doit être un JSON valide' }
        },
        { status: 400 }
      )
    }

    // Validate with Zod schema
    const validationResult = signupSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error?.issues?.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message
        return acc
      }, {} as Record<string, string>) || {}

      return NextResponse.json<SignupErrorResponse>(
        {
          error: 'Données de validation invalides',
          details: Object.keys(errors).length > 0 ? errors : { validation: validationResult.error.message }
        },
        { status: 400 }
      )
    }

    const { email, password, fullName } = validationResult.data

    // ============================================
    // STEP 2: Validate password strength
    // ============================================

    const strengthCheck = validatePasswordStrength(password)

    if (!strengthCheck.valid) {
      return NextResponse.json<SignupErrorResponse>(
        {
          error: 'Le mot de passe ne respecte pas les critères de sécurité',
          details: strengthCheck.errors
        },
        { status: 400 }
      )
    }

    // ============================================
    // STEP 3: Check password breach database
    // ============================================

    const isBreached = await isPasswordBreached(password)

    if (isBreached) {
      return NextResponse.json<SignupErrorResponse>(
        {
          error: 'Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre pour votre sécurité.'
        },
        { status: 400 }
      )
    }

    // ============================================
    // STEP 4: Check if email already exists
    // ============================================

    const existingUserResult = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    )

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json<SignupErrorResponse>(
        {
          error: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.'
        },
        { status: 409 }
      )
    }

    // ============================================
    // STEP 5: Hash password with Argon2id
    // ============================================

    let passwordHash: string

    try {
      passwordHash = await hashPassword(password)
    } catch (error) {
      console.error('Password hashing error:', error)
      return NextResponse.json<SignupErrorResponse>(
        { error: 'Erreur lors du traitement du mot de passe' },
        { status: 500 }
      )
    }

    // ============================================
    // STEP 6: Create user in database
    // ============================================

    const createUserResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, email, full_name, role`,
      [email, passwordHash, fullName, 'user', false, true]
    )

    const user = createUserResult.rows[0]

    if (!user) {
      throw new Error('Failed to create user: No user returned from INSERT')
    }

    // ============================================
    // STEP 7: Generate device fingerprint
    // ============================================

    const deviceFingerprint = generateDeviceFingerprint(request)
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || null

    // ============================================
    // STEP 8: Create session with temporary hash
    // ============================================

    // Create session first to get session_id (needed for JWT generation)
    // We'll update the hash after generating the actual JWT refresh token
    const createSessionResult = await query(
      `INSERT INTO sessions (
        user_id,
        refresh_token_hash,
        device_fingerprint,
        ip_address,
        user_agent,
        expires_at,
        last_activity_at
      )
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days', NOW())
       RETURNING session_id`,
      [
        user.user_id,
        'temp',  // Temporary hash, will be updated after token generation
        deviceFingerprint,
        clientIp,
        userAgent
      ]
    )

    const sessionId = createSessionResult.rows[0].session_id

    if (!sessionId) {
      throw new Error('Failed to create session: No session_id returned')
    }

    // ============================================
    // STEP 9: Generate JWT tokens
    // ============================================

    let accessToken: string
    let refreshToken: string

    try {
      accessToken = await generateAccessToken({
        userId: Number(user.user_id),  // Convert BIGINT to number (like login route)
        email: user.email,
        role: user.role
      })

      refreshToken = await generateRefreshToken(sessionId)
    } catch (error) {
      console.error('Token generation error:', error)

      // Clean up created user and session
      await query('DELETE FROM sessions WHERE session_id = $1', [sessionId])
      await query('DELETE FROM users WHERE user_id = $1', [user.user_id])

      return NextResponse.json<SignupErrorResponse>(
        { error: 'Erreur lors de la génération des jetons d\'authentification' },
        { status: 500 }
      )
    }

    // ============================================
    // STEP 10: Update session with actual token hash
    // ============================================

    // Hash the actual JWT refresh token for secure storage
    // This allows refresh endpoint to verify the token against database
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    await query(
      'UPDATE sessions SET refresh_token_hash = $1 WHERE session_id = $2',
      [refreshTokenHash, sessionId]
    )

    // ============================================
    // STEP 11: Update last login timestamp
    // ============================================

    await query(
      'UPDATE users SET last_login_at = NOW() WHERE user_id = $1',
      [user.user_id]
    )

    // ============================================
    // STEP 12: Create response with cookies
    // ============================================

    const response = NextResponse.json<SignupSuccessResponse>(
      {
        success: true,
        user: {
          id: Number(user.user_id),  // Convert BIGINT to number for consistency
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        message: 'Compte créé avec succès. Bienvenue sur STAT-DISCUTE !'
      },
      { status: 201 }
    )

    // Set access token cookie (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/'
    })

    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    return response

  } catch (error) {
    // ============================================
    // GLOBAL ERROR HANDLER
    // ============================================

    // Log full error for debugging (in production, use proper logging service)
    console.error('Signup error:', error)

    // Never expose internal error details to client
    return NextResponse.json<SignupErrorResponse>(
      {
        error: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.'
      },
      { status: 500 }
    )
  }
}

// ============================================
// METHOD NOT ALLOWED HANDLER
// ============================================

/**
 * Handle non-POST requests
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<SignupErrorResponse>(
    { error: 'Méthode non autorisée. Utilisez POST pour créer un compte.' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json<SignupErrorResponse>(
    { error: 'Méthode non autorisée. Utilisez POST pour créer un compte.' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json<SignupErrorResponse>(
    { error: 'Méthode non autorisée. Utilisez POST pour créer un compte.' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json<SignupErrorResponse>(
    { error: 'Méthode non autorisée. Utilisez POST pour créer un compte.' },
    { status: 405 }
  )
}
