import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateAccessToken, TokenInvalidError, TokenExpiredError } from '@/lib/auth/jwt'
import { query } from '@/lib/db'
import crypto from 'crypto'

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 *
 * Process:
 * 1. Extract refresh token from cookie
 * 2. Verify refresh token signature and expiry
 * 3. Hash token and find session in database
 * 4. Validate session (not expired, not revoked)
 * 5. Update last_activity_at timestamp
 * 6. Generate NEW access token (keep refresh token)
 * 7. Set new access token cookie
 * 8. Return new access token and expiry
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify refresh token signature and decode
    let sessionId: string
    try {
      const payload = await verifyRefreshToken(refreshToken)
      sessionId = payload.sessionId
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json(
          { error: 'Refresh token has expired. Please login again.' },
          { status: 401 }
        )
      }

      if (error instanceof TokenInvalidError) {
        return NextResponse.json(
          { error: 'Invalid refresh token' },
          { status: 401 }
        )
      }

      throw error
    }

    // Hash the refresh token to match database storage
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    // Find session in database and check validity
    const sessionResult = await query(
      `SELECT
         s.session_id,
         s.user_id,
         s.expires_at,
         s.is_revoked,
         s.revoke_reason,
         u.email,
         u.role,
         u.is_active
       FROM sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.session_id = $1
         AND s.refresh_token_hash = $2`,
      [sessionId, refreshTokenHash]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      )
    }

    const session = sessionResult.rows[0]

    // Check if session is revoked
    if (session.is_revoked) {
      return NextResponse.json(
        { error: `Session revoked: ${session.revoke_reason || 'unknown'}` },
        { status: 401 }
      )
    }

    // Check if session has expired
    const now = new Date()
    const expiresAt = new Date(session.expires_at)

    if (expiresAt < now) {
      // Mark session as expired in database
      await query(
        `UPDATE sessions
         SET is_revoked = true,
             revoked_at = NOW(),
             revoke_reason = 'expired'
         WHERE session_id = $1`,
        [sessionId]
      )

      return NextResponse.json(
        { error: 'Session has expired. Please login again.' },
        { status: 401 }
      )
    }

    // Check if user account is active
    if (!session.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      )
    }

    // Update last_activity_at timestamp
    await query(
      `UPDATE sessions
       SET last_activity_at = NOW()
       WHERE session_id = $1`,
      [sessionId]
    )

    // Generate NEW access token with fresh user data
    const accessToken = await generateAccessToken({
      userId: session.user_id,
      email: session.email,
      role: session.role
    })

    // Calculate access token expiry (15 minutes from now)
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    // Create response with new access token
    const response = NextResponse.json({
      success: true,
      accessToken,
      expiresAt: accessTokenExpiry.toISOString(),
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role
      }
    })

    // Set new access token cookie (httpOnly, secure, sameSite=lax)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)

    return NextResponse.json(
      { error: 'Token refresh failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
