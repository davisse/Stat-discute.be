/**
 * Rate Limiting and Account Lockout System
 *
 * Implements comprehensive rate limiting for login attempts:
 * - IP-based rate limiting (10 attempts per 15 minutes)
 * - Account-based rate limiting (5 attempts per 15 minutes)
 * - Automatic account lockout after failed attempts
 * - Security event logging
 */

import { query } from '@/lib/db'

// ============================================
// CONFIGURATION
// ============================================

const RATE_LIMIT_CONFIG = {
  // IP-based limits
  maxAttemptsPerIp: 10,
  ipWindowMinutes: 15,

  // Account-based limits
  maxAttemptsPerAccount: 5,
  accountWindowMinutes: 15,

  // Lockout settings
  lockoutDurationMinutes: 30,
  lockoutThreshold: 5, // Failed attempts before lockout
}

// ============================================
// TYPES
// ============================================

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  resetAt?: Date
  attemptsRemaining?: number
}

export interface LockoutResult {
  locked: boolean
  lockedUntil?: Date
  failedAttempts?: number
}

// ============================================
// RATE LIMITING FUNCTIONS
// ============================================

/**
 * Check if login attempt is allowed based on rate limits
 *
 * @param email - User email (lowercase)
 * @param ipAddress - Client IP address
 * @returns Rate limit check result
 */
export async function checkLoginRateLimit(
  email: string,
  ipAddress: string
): Promise<RateLimitResult> {
  try {
    // Check IP-based rate limit
    const ipAttempts = await getRecentAttemptsByIp(ipAddress)
    if (ipAttempts >= RATE_LIMIT_CONFIG.maxAttemptsPerIp) {
      const resetAt = new Date()
      resetAt.setMinutes(resetAt.getMinutes() + RATE_LIMIT_CONFIG.ipWindowMinutes)
      return {
        allowed: false,
        reason: 'Trop de tentatives depuis cette adresse IP. Veuillez réessayer plus tard.',
        resetAt,
        attemptsRemaining: 0,
      }
    }

    // Check account-based rate limit
    const accountAttempts = await getRecentAttemptsByEmail(email)
    if (accountAttempts >= RATE_LIMIT_CONFIG.maxAttemptsPerAccount) {
      const resetAt = new Date()
      resetAt.setMinutes(resetAt.getMinutes() + RATE_LIMIT_CONFIG.accountWindowMinutes)
      return {
        allowed: false,
        reason: 'Trop de tentatives pour ce compte. Veuillez réessayer plus tard.',
        resetAt,
        attemptsRemaining: 0,
      }
    }

    return {
      allowed: true,
      attemptsRemaining: Math.min(
        RATE_LIMIT_CONFIG.maxAttemptsPerIp - ipAttempts,
        RATE_LIMIT_CONFIG.maxAttemptsPerAccount - accountAttempts
      ),
    }
  } catch (error) {
    console.error('[RATE LIMIT CHECK ERROR]', error)
    // Allow login attempt if rate limit check fails (fail open for availability)
    return { allowed: true }
  }
}

/**
 * Check if account is locked out
 *
 * @param email - User email
 * @returns Lockout status
 */
export async function checkAccountLockout(email: string): Promise<LockoutResult> {
  try {
    const result = await query(
      `SELECT locked_until, failed_login_attempts
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return { locked: false }
    }

    const user = result.rows[0]
    const lockedUntil = user.locked_until ? new Date(user.locked_until) : null

    if (lockedUntil && lockedUntil > new Date()) {
      return {
        locked: true,
        lockedUntil,
        failedAttempts: user.failed_login_attempts,
      }
    }

    return {
      locked: false,
      failedAttempts: user.failed_login_attempts,
    }
  } catch (error) {
    console.error('[ACCOUNT LOCKOUT CHECK ERROR]', error)
    return { locked: false }
  }
}

/**
 * Handle failed login attempt
 * - Increments failed attempt counter
 * - Records security event
 * - Locks account if threshold exceeded
 *
 * @param userId - User ID (null if user not found)
 * @param email - User email
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 * @param reason - Failure reason
 */
export async function handleFailedLogin(
  userId: bigint | null,
  email: string,
  ipAddress: string,
  userAgent: string | null,
  reason: string
): Promise<void> {
  try {
    // Log the failed attempt
    await logLoginAttempt(email, ipAddress, userAgent, false, reason)

    // If we have a userId, increment failed attempts on user record
    if (userId !== null) {
      const result = await query(
        `UPDATE users
         SET failed_login_attempts = failed_login_attempts + 1,
             last_failed_login_at = NOW()
         WHERE user_id = $1
         RETURNING failed_login_attempts`,
        [userId.toString()]
      )

      // Check if we should lock the account
      const failedAttempts = result.rows[0]?.failed_login_attempts || 0
      if (failedAttempts >= RATE_LIMIT_CONFIG.lockoutThreshold) {
        const lockoutUntil = new Date()
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + RATE_LIMIT_CONFIG.lockoutDurationMinutes)

        await query(
          `UPDATE users SET locked_until = $1 WHERE user_id = $2`,
          [lockoutUntil.toISOString(), userId.toString()]
        )

        console.log(`[SECURITY] Account locked: ${email} until ${lockoutUntil.toISOString()}`)
      }
    }
  } catch (error) {
    console.error('[HANDLE FAILED LOGIN ERROR]', error)
  }
}

/**
 * Handle successful login
 * - Resets failed attempt counter
 * - Records successful login event
 *
 * @param userId - User ID
 * @param email - User email
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 */
export async function handleSuccessfulLogin(
  userId: bigint,
  email: string,
  ipAddress: string,
  userAgent: string | null
): Promise<void> {
  try {
    // Reset failed attempts and unlock account
    await query(
      `UPDATE users
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW()
       WHERE user_id = $1`,
      [userId.toString()]
    )

    // Log successful login
    await logLoginAttempt(email, ipAddress, userAgent, true, null)
  } catch (error) {
    console.error('[HANDLE SUCCESSFUL LOGIN ERROR]', error)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get recent login attempts from an IP address
 */
async function getRecentAttemptsByIp(ipAddress: string): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM login_attempts
       WHERE ip_address = $1
         AND attempt_time > NOW() - INTERVAL '${RATE_LIMIT_CONFIG.ipWindowMinutes} minutes'
         AND success = false`,
      [ipAddress]
    )
    return parseInt(result.rows[0]?.count || '0', 10)
  } catch (error) {
    // Table might not exist yet
    console.error('[GET IP ATTEMPTS ERROR]', error)
    return 0
  }
}

/**
 * Get recent login attempts for an email
 */
async function getRecentAttemptsByEmail(email: string): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM login_attempts
       WHERE email = $1
         AND attempt_time > NOW() - INTERVAL '${RATE_LIMIT_CONFIG.accountWindowMinutes} minutes'
         AND success = false`,
      [email.toLowerCase()]
    )
    return parseInt(result.rows[0]?.count || '0', 10)
  } catch (error) {
    // Table might not exist yet
    console.error('[GET EMAIL ATTEMPTS ERROR]', error)
    return 0
  }
}

/**
 * Log a login attempt to the database
 */
async function logLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string | null,
  success: boolean,
  failureReason: string | null
): Promise<void> {
  try {
    await query(
      `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason, attempt_time)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [email.toLowerCase(), ipAddress, userAgent, success, failureReason]
    )
  } catch (error) {
    // Table might not exist - log but don't fail
    console.error('[LOG LOGIN ATTEMPT ERROR]', error)
  }
}
