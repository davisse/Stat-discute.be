/**
 * Next.js Middleware - Route Protection and Authentication
 *
 * Protects dashboard routes and admin routes with JWT authentication.
 * Validates access tokens from cookies and adds user context to request headers.
 *
 * Security Features:
 * - Automatic redirect to login for unauthenticated users
 * - Role-based access control (admin routes require admin role)
 * - Token validation with comprehensive error handling
 * - User context propagation via response headers
 *
 * @module middleware
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken, TokenExpiredError, TokenInvalidError } from '@/lib/auth/jwt'

// Protected route patterns
const PROTECTED_ROUTES = [
  '/dashboard',
  '/players',
  '/teams',
  '/betting',
  '/player-props'
]

// Public routes that are exceptions to protected routes
// These pages show aggregate statistics, no user-specific data
const PUBLIC_ROUTES = [
  '/player-props/tonight',
  '/betting/totals',
  '/betting/odds-movement',
  '/betting/odds-terminal'
]

const ADMIN_ROUTES = [
  '/admin'
]

/**
 * Attempt to refresh access token by calling the refresh API endpoint
 * This works in Edge Runtime since it uses fetch
 */
async function attemptTokenRefresh(
  request: NextRequest,
  refreshToken: string
): Promise<{
  accessToken: string
  payload: { userId: number; email: string; role: 'user' | 'premium' | 'admin' }
} | null> {
  try {
    // Build the refresh API URL from the request
    const baseUrl = request.nextUrl.origin
    const refreshUrl = `${baseUrl}/api/auth/refresh`

    // Call the refresh endpoint with the refresh token cookie
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Cookie': `refreshToken=${refreshToken}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.success || !data.accessToken || !data.user) {
      return null
    }

    return {
      accessToken: data.accessToken,
      payload: {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role
      }
    }
  } catch (error) {
    console.error('Token refresh in middleware failed:', error)
    return null
  }
}

/**
 * Next.js Middleware Handler
 *
 * Executed on every request matching the config.matcher patterns.
 * Validates JWT tokens and enforces role-based access control.
 *
 * Flow:
 * 1. Check if route is protected
 * 2. Extract access token from cookies
 * 3. Verify token signature and expiry
 * 4. Check role requirements for admin routes
 * 5. Add user context to response headers
 * 6. Redirect to login if authentication fails
 *
 * @param request - Next.js request object
 * @returns Next.js response (continue or redirect)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if current path is a public exception (before checking protection)
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // Public routes are allowed without authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  const isAdminRoute = ADMIN_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // If route is not protected, continue without authentication
  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  // Extract tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // No access token: try to refresh if refresh token exists
  if (!accessToken) {
    if (refreshToken) {
      const refreshResult = await attemptTokenRefresh(request, refreshToken)

      if (refreshResult) {
        // Refresh successful: continue with new token
        const response = NextResponse.next()

        // Set new access token cookie
        response.cookies.set('accessToken', refreshResult.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes
          path: '/'
        })

        // Check admin route access with refreshed payload
        if (isAdminRoute && refreshResult.payload.role !== 'admin') {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/dashboard'
          redirectUrl.searchParams.set('error', 'admin_required')
          return NextResponse.redirect(redirectUrl)
        }

        // Add user context to response headers
        response.headers.set('x-user-id', refreshResult.payload.userId.toString())
        response.headers.set('x-user-email', refreshResult.payload.email)
        response.headers.set('x-user-role', refreshResult.payload.role)

        return response
      }
    }

    // No refresh token or refresh failed: redirect to login
    return redirectToLogin(request)
  }

  try {
    // Verify JWT token signature, expiry, and claims
    const payload = await verifyAccessToken(accessToken)

    // Admin route protection: only admin role can access
    if (isAdminRoute && payload.role !== 'admin') {
      // Non-admin trying to access admin route: redirect to dashboard
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      redirectUrl.searchParams.set('error', 'admin_required')

      return NextResponse.redirect(redirectUrl)
    }

    // Authentication successful: continue with request
    const response = NextResponse.next()

    // Add user context to response headers for server components
    // These headers are accessible in Server Components via headers() function
    response.headers.set('x-user-id', payload.userId.toString())
    response.headers.set('x-user-email', payload.email)
    response.headers.set('x-user-role', payload.role)

    return response

  } catch (error) {
    // Token verification failed

    if (error instanceof TokenExpiredError) {
      // Access token expired: attempt to refresh using refresh token
      if (refreshToken) {
        const refreshResult = await attemptTokenRefresh(request, refreshToken)

        if (refreshResult) {
          // Refresh successful: continue with new token
          const response = NextResponse.next()

          // Set new access token cookie
          response.cookies.set('accessToken', refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/'
          })

          // Check admin route access with refreshed payload
          if (isAdminRoute && refreshResult.payload.role !== 'admin') {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/dashboard'
            redirectUrl.searchParams.set('error', 'admin_required')
            return NextResponse.redirect(redirectUrl)
          }

          // Add user context to response headers
          response.headers.set('x-user-id', refreshResult.payload.userId.toString())
          response.headers.set('x-user-email', refreshResult.payload.email)
          response.headers.set('x-user-role', refreshResult.payload.role)

          return response
        }
      }

      // Refresh failed or no refresh token: redirect to login
      return redirectToLogin(request, 'expired')
    }

    if (error instanceof TokenInvalidError) {
      // Token invalid: redirect to login with invalid flag
      // This could indicate tampering or corruption
      return redirectToLogin(request, 'invalid')
    }

    // Unknown error: redirect to login with generic error
    // Don't expose internal error details for security
    console.error('Middleware authentication error:', error)
    return redirectToLogin(request, 'error')
  }
}

/**
 * Redirect user to login page with optional error parameter
 *
 * Preserves the original URL in the 'redirect' query parameter
 * so user can be redirected back after successful login.
 *
 * @param request - Next.js request object
 * @param reason - Optional error reason (expired, invalid, error)
 * @returns Next.js redirect response
 */
function redirectToLogin(request: NextRequest, reason?: string): NextResponse {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'

  // Add redirect parameter to return user to original page after login
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)

  // Add error reason if provided
  if (reason) {
    loginUrl.searchParams.set('error', reason)
  }

  return NextResponse.redirect(loginUrl)
}

/**
 * Middleware Configuration
 *
 * Defines which routes should execute this middleware.
 * Uses Next.js matcher patterns for efficient route matching.
 *
 * Protected routes:
 * - /dashboard (and all sub-routes)
 * - /players (and all sub-routes)
 * - /teams (and all sub-routes)
 * - /betting (and all sub-routes)
 * - /player-props (and all sub-routes)
 * - /admin (and all sub-routes)
 *
 * Excluded:
 * - /api/* (API routes handle their own authentication)
 * - /_next/* (Next.js internal routes)
 * - Static files (favicon, etc.)
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/players/:path*',
    '/teams/:path*',
    '/betting/:path*',
    '/player-props/:path*',
    '/admin/:path*'
  ]
}
