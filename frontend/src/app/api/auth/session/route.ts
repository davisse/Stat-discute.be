import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, TokenInvalidError, TokenExpiredError } from '@/lib/auth/jwt'
import { query } from '@/lib/db'

/**
 * GET /api/auth/session
 * Check current authentication status and return user data
 *
 * Process:
 * 1. Verify access token from cookie
 * 2. Extract user data from token payload
 * 3. Optionally query database for fresh user data (verify account status)
 * 4. Return { authenticated: true, user: {...} } or { authenticated: false }
 *
 * Used by:
 * - AuthContext to initialize user state on page load
 * - Protected routes to verify authentication
 * - Client-side code to check current auth status
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 401 })  // 401 Unauthorized for missing auth
    }

    // Verify access token signature and decode
    let tokenPayload: {
      userId: number
      email: string
      role: 'user' | 'premium' | 'admin'
    }

    try {
      tokenPayload = await verifyAccessToken(accessToken)
    } catch (error) {
      // Token is invalid or expired
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Token expired',
          requiresRefresh: true
        }, { status: 401 })  // 401 Unauthorized for expired token
      }

      if (error instanceof TokenInvalidError) {
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Invalid token'
        }, { status: 401 })  // 401 Unauthorized for invalid token
      }

      throw error
    }

    // Query database for fresh user data
    // This ensures we have the latest user status (is_active, role changes, etc.)
    const userResult = await query(
      `SELECT
         user_id,
         email,
         full_name,
         role,
         is_active,
         email_verified,
         created_at,
         last_login_at
       FROM users
       WHERE user_id = $1`,
      [tokenPayload.userId]
    )

    if (userResult.rows.length === 0) {
      // User no longer exists in database
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'User not found'
      })
    }

    const user = userResult.rows[0]

    // Check if user account is active
    if (!user.is_active) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Account is disabled'
      })
    }

    // Return authenticated user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      }
    })

  } catch (error) {
    console.error('Session check error:', error)

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Session check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Additional endpoint for lightweight session check
 * Only verifies token without database query (faster)
 * Useful for high-frequency checks where database verification isn't needed
 */
export async function HEAD(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return new NextResponse(null, { status: 401 })
    }

    // Just verify token signature and expiry
    await verifyAccessToken(accessToken)

    return new NextResponse(null, { status: 200 })

  } catch (error) {
    return new NextResponse(null, { status: 401 })
  }
}
