/**
 * Password Hashing and Verification
 *
 * Uses Argon2id for password hashing (OWASP 2025 recommended)
 * - 300x more resistant to GPU attacks than bcrypt
 * - Memory-hard function prevents ASIC attacks
 * - Constant-time verification prevents timing attacks
 */

import * as argon2 from 'argon2'

// ============================================
// CONFIGURATION
// ============================================

/**
 * Argon2id configuration following OWASP recommendations
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const ARGON2_CONFIG: argon2.Options = {
  type: argon2.argon2id,      // Argon2id variant (hybrid of argon2i and argon2d)
  memoryCost: 65536,          // 64 MB memory
  timeCost: 3,                // 3 iterations
  parallelism: 4,             // 4 parallel threads
  hashLength: 32,             // 32 bytes output
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Hash a password using Argon2id
 *
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, ARGON2_CONFIG)
}

/**
 * Verify a password against a hash
 *
 * Uses constant-time comparison to prevent timing attacks.
 * Returns true if the password matches, false otherwise.
 *
 * @param hash - Stored password hash
 * @param password - Plain text password to verify
 * @returns True if password matches hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    // Log error but return false to prevent information leakage
    console.error('[PASSWORD VERIFY ERROR]', error)
    return false
  }
}

/**
 * Check if a password hash needs to be rehashed
 *
 * Should be called after successful verification to check if
 * the hash parameters need to be upgraded (e.g., after config change)
 *
 * @param hash - Current password hash
 * @returns True if rehashing is recommended
 */
export async function needsRehash(hash: string): Promise<boolean> {
  try {
    return argon2.needsRehash(hash, ARGON2_CONFIG)
  } catch {
    return false
  }
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }

  if (password.length > 128) {
    errors.push('Le mot de passe ne peut pas dépasser 128 caractères')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a password has been exposed in known data breaches
 *
 * Uses Have I Been Pwned API with k-Anonymity model:
 * - Only first 5 chars of SHA-1 hash are sent to API
 * - Full password never leaves the client
 * - Returns true if password appears in known breach
 *
 * @param password - Password to check
 * @returns True if password has been breached
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    // Create SHA-1 hash of password
    const crypto = await import('crypto')
    const hash = crypto.createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase()

    // k-Anonymity: only send first 5 characters
    const prefix = hash.substring(0, 5)
    const suffix = hash.substring(5)

    // Query Have I Been Pwned API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'StatDiscute-PasswordCheck',
        },
      }
    )

    if (!response.ok) {
      // If API fails, don't block user - log and return false
      console.warn('[HIBP API ERROR]', response.status, response.statusText)
      return false
    }

    // Parse response - each line is "SUFFIX:COUNT"
    const text = await response.text()
    const lines = text.split('\n')

    // Check if our suffix appears in the results
    for (const line of lines) {
      const [hashSuffix] = line.split(':')
      if (hashSuffix?.trim() === suffix) {
        return true // Password found in breach database
      }
    }

    return false
  } catch (error) {
    // Don't block registration if breach check fails
    console.error('[BREACH CHECK ERROR]', error)
    return false
  }
}
