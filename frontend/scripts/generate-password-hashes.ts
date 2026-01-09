/**
 * Generate correct Argon2id password hashes
 *
 * Run with: npx tsx scripts/generate-password-hashes.ts
 */

import * as argon2 from 'argon2'

const ARGON2_CONFIG: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,          // 64 MB memory
  timeCost: 3,                // 3 iterations
  parallelism: 4,             // 4 parallel threads
  hashLength: 32,             // 32 bytes output
}

async function main() {
  const passwords = [
    { email: 'admin@stat-discute.be', password: 'Admin123!' },
    { email: 'demo@stat-discute.be', password: 'Demo123!' },
  ]

  console.log('Generating password hashes with argon2 library...\n')
  console.log('Config:', JSON.stringify({
    type: 'argon2id',
    memoryCost: ARGON2_CONFIG.memoryCost,
    timeCost: ARGON2_CONFIG.timeCost,
    parallelism: ARGON2_CONFIG.parallelism,
    hashLength: ARGON2_CONFIG.hashLength,
  }, null, 2))
  console.log('')

  for (const { email, password } of passwords) {
    const hash = await argon2.hash(password, ARGON2_CONFIG)
    console.log(`-- ${email} (password: ${password})`)
    console.log(`'${hash}'`)
    console.log('')

    // Verify the hash works
    const verified = await argon2.verify(hash, password)
    console.log(`Verification: ${verified ? 'PASSED' : 'FAILED'}`)
    console.log('')
  }

  // Generate SQL UPDATE statements
  console.log('\n-- SQL UPDATE statements:')
  for (const { email, password } of passwords) {
    const hash = await argon2.hash(password, ARGON2_CONFIG)
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${email}';`)
  }
}

main().catch(console.error)
