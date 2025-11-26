import * as jose from 'jose'
import type { CryptoKey } from 'jose'

// Token configuration constants
export const ACCESS_TOKEN_CONFIG = {
  algorithm: 'EdDSA' as const,
  expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  issuer: process.env.JWT_ISSUER || 'stat-discute.be',
  audience: process.env.JWT_AUDIENCE || 'stat-discute-api'
} as const

export const REFRESH_TOKEN_CONFIG = {
  algorithm: 'EdDSA' as const,
  expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'stat-discute.be',
  audience: 'stat-discute-refresh'
} as const

// Type definitions
export interface TokenPayload {
  userId: number
  email: string
  role: 'user' | 'premium' | 'admin'
}

export interface RefreshTokenPayload {
  sessionId: string
}

export interface DecodedAccessToken extends TokenPayload {
  iss: string
  aud: string
  exp: number
  iat: number
}

export interface DecodedRefreshToken extends RefreshTokenPayload {
  iss: string
  aud: string
  exp: number
  iat: number
}

// Custom error types for better error handling
export class TokenExpiredError extends Error {
  constructor() {
    super('Token has expired')
    this.name = 'TokenExpiredError'
  }
}

export class TokenInvalidError extends Error {
  constructor(message: string = 'Token is invalid') {
    super(message)
    this.name = 'TokenInvalidError'
  }
}

// Key import utilities
// Handle escaped newlines from environment variables (common in Docker)
function normalizeKey(pem: string): string {
  return pem.replace(/\\n/g, '\n')
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  if (!pem) {
    throw new Error('JWT_PRIVATE_KEY environment variable is not set')
  }

  try {
    return await jose.importPKCS8(normalizeKey(pem), 'EdDSA')
  } catch (error) {
    throw new Error(`Failed to import private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  if (!pem) {
    throw new Error('JWT_PUBLIC_KEY environment variable is not set')
  }

  try {
    return await jose.importSPKI(normalizeKey(pem), 'EdDSA')
  } catch (error) {
    throw new Error(`Failed to import public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate an access token (15-minute expiry)
 * Contains user identification and authorization data
 *
 * @param payload - User data to encode in the token
 * @returns Signed JWT access token string
 * @throws Error if private key is missing or invalid
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const privateKey = await importPrivateKey(process.env.JWT_PRIVATE_KEY!)

  try {
    return await new jose.SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuer(ACCESS_TOKEN_CONFIG.issuer)
      .setAudience(ACCESS_TOKEN_CONFIG.audience)
      .setExpirationTime(ACCESS_TOKEN_CONFIG.expiresIn)
      .setIssuedAt()
      .sign(privateKey)
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a refresh token (7-day expiry)
 * Contains only session ID for security
 *
 * @param sessionId - UUID of the session in the database
 * @returns Signed JWT refresh token string
 * @throws Error if private key is missing or invalid
 */
export async function generateRefreshToken(sessionId: string): Promise<string> {
  const privateKey = await importPrivateKey(process.env.JWT_PRIVATE_KEY!)

  try {
    return await new jose.SignJWT({ sessionId })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuer(REFRESH_TOKEN_CONFIG.issuer)
      .setAudience(REFRESH_TOKEN_CONFIG.audience)
      .setExpirationTime(REFRESH_TOKEN_CONFIG.expiresIn)
      .setIssuedAt()
      .sign(privateKey)
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify and decode an access token
 * Validates signature, expiry, issuer, and audience
 *
 * @param token - JWT access token string
 * @returns Decoded token payload with user data
 * @throws TokenExpiredError if token has expired
 * @throws TokenInvalidError if signature, issuer, or audience is invalid
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const publicKey = await importPublicKey(process.env.JWT_PUBLIC_KEY!)

  try {
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: ACCESS_TOKEN_CONFIG.issuer,
      audience: ACCESS_TOKEN_CONFIG.audience
    })

    // Validate payload structure
    if (
      typeof payload.userId !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      !['user', 'premium', 'admin'].includes(payload.role)
    ) {
      throw new TokenInvalidError('Invalid token payload structure')
    }

    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as 'user' | 'premium' | 'admin'
    }
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new TokenExpiredError()
    }

    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      throw new TokenInvalidError(`Token claim validation failed: ${error.message}`)
    }

    if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      throw new TokenInvalidError('Token signature verification failed')
    }

    if (error instanceof TokenInvalidError) {
      throw error
    }

    throw new TokenInvalidError(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify and decode a refresh token
 * Validates signature, expiry, issuer, and audience
 *
 * @param token - JWT refresh token string
 * @returns Decoded token payload with session ID
 * @throws TokenExpiredError if token has expired
 * @throws TokenInvalidError if signature, issuer, or audience is invalid
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const publicKey = await importPublicKey(process.env.JWT_PUBLIC_KEY!)

  try {
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: REFRESH_TOKEN_CONFIG.issuer,
      audience: REFRESH_TOKEN_CONFIG.audience
    })

    // Validate payload structure
    if (typeof payload.sessionId !== 'string') {
      throw new TokenInvalidError('Invalid refresh token payload structure')
    }

    return {
      sessionId: payload.sessionId as string
    }
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new TokenExpiredError()
    }

    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      throw new TokenInvalidError(`Token claim validation failed: ${error.message}`)
    }

    if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      throw new TokenInvalidError('Token signature verification failed')
    }

    if (error instanceof TokenInvalidError) {
      throw error
    }

    throw new TokenInvalidError(`Refresh token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decode a token without verifying its signature
 * SECURITY WARNING: Only use for debugging or extracting claims before verification
 * Always verify tokens before trusting their contents
 *
 * @param token - JWT token string
 * @returns Decoded token payload (unverified)
 */
export function decodeTokenUnsafe(token: string): jose.JWTPayload {
  try {
    return jose.decodeJwt(token)
  } catch (error) {
    throw new TokenInvalidError('Failed to decode token')
  }
}

/**
 * Check if a token is expired without full verification
 * Useful for deciding whether to refresh or redirect to login
 *
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jose.decodeJwt(token)

    if (!decoded.exp) {
      return true // No expiration claim means invalid token
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true // If we can't decode it, consider it expired
  }
}

/**
 * Get time until token expiration in seconds
 *
 * @param token - JWT token string
 * @returns seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string): number {
  try {
    const decoded = jose.decodeJwt(token)

    if (!decoded.exp) {
      return 0
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const timeRemaining = decoded.exp - currentTime

    return Math.max(0, timeRemaining)
  } catch {
    return 0
  }
}
