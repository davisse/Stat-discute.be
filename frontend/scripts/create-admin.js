/**
 * Create Admin User Script
 *
 * Creates a default admin user for STAT-DISCUTE platform
 * Uses Argon2id password hashing for security
 */

import argon2 from '@node-rs/argon2'
import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from frontend/.env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const { Pool } = pg

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nba_stats',
  user: process.env.DB_USER || 'chapirou',
  password: process.env.DB_PASSWORD || ''
})

// OWASP 2025 recommended Argon2id configuration
const ARGON2_CONFIG = {
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // 3 iterations
  parallelism: 4      // 4 threads
}

async function createAdminUser() {
  console.log('🔐 Creating admin user for STAT-DISCUTE...\n')

  const adminEmail = 'admin@stat-discute.be'
  const adminPassword = 'Admin@StatDiscute2025!'  // Strong default password
  const adminFullName = 'Administrator'

  try {
    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT user_id, email, role FROM users WHERE email = $1',
      [adminEmail]
    )

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]
      console.log('⚠️  Admin user already exists:')
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   User ID: ${user.user_id}`)

      // If user exists but is not admin, upgrade to admin
      if (user.role !== 'admin') {
        await pool.query(
          'UPDATE users SET role = $1 WHERE user_id = $2',
          ['admin', user.user_id]
        )
        console.log('✅ User upgraded to admin role')
      }

      await pool.end()
      return
    }

    // Hash password with Argon2id
    console.log('🔨 Hashing password with Argon2id...')
    const passwordHash = await argon2.hash(adminPassword, ARGON2_CONFIG)

    // Create admin user
    console.log('📝 Creating admin user in database...')
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, email, full_name, role, created_at`,
      [adminEmail, passwordHash, adminFullName, 'admin', true, true]
    )

    const user = result.rows[0]

    console.log('\n✅ Admin user created successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Admin Credentials')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${user.email}`)
    console.log(`Password: ${adminPassword}`)
    console.log(`Role:     ${user.role}`)
    console.log(`User ID:  ${user.user_id}`)
    console.log(`Created:  ${user.created_at}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
    console.log('💡 Login at: http://localhost:3000/login\n')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the script
createAdminUser().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
