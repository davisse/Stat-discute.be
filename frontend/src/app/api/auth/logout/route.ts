import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, TokenInvalidError, TokenExpiredError } from '@/lib/auth/jwt'
import { query } from '@/lib/db'
import crypto from 'crypto'

/**
 * POST /api/auth/logout
 * Logout endpoint that revokes the user's session
 *
 * Process:
 * 1. Verify access token from cookie
 * 2. Extract refresh token and hash it
 * 3. Find and revoke session in database
 * 4. Clear both access and refresh token cookies
 * 5. Return success message
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Verify access token
    let userId: number
    try {
      const payload = await verifyAccessToken(accessToken)
      userId = payload.userId
    } catch (error) {
      // Token is invalid or expired, but we still want to clear cookies
      if (error instanceof TokenExpiredError || error instanceof TokenInvalidError) {
        const response = NextResponse.json(
          { success: true, message: 'Logged out (expired session)' }
        )

        // Clear cookies even if token is invalid
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')

        return response
      }
      throw error
    }

    // Get refresh token to find session
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (refreshToken) {
      // Hash the refresh token to match database storage
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      // Revoke session in database
      await query(
        `UPDATE sessions
         SET is_revoked = true,
             revoked_at = NOW(),
             revoke_reason = 'user_logout'
         WHERE refresh_token_hash = $1
           AND user_id = $2
           AND is_revoked = false`,
        [refreshTokenHash, userId]
      )
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear both cookies
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response

  } catch (error) {
    console.error('Logout error:', error)

    // Still try to clear cookies on error
    const response = NextResponse.json(
      { error: 'Logout failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )

    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response
  }
}
