/**
 * Generate EdDSA (Ed25519) key pair for JWT signing
 *
 * This script generates a cryptographically secure key pair for JWT token signing.
 * Run this once and add the keys to your .env.local file.
 *
 * Usage:
 *   node scripts/generate-jwt-keys.js
 */

const jose = require('jose');

(async () => {
  console.log('🔐 Generating EdDSA (Ed25519) key pair for JWT signing...\n');

  try {
    // Generate key pair
    const { publicKey, privateKey } = await jose.generateKeyPair('EdDSA');

    // Export keys in PEM format
    const privateKeyPem = await jose.exportPKCS8(privateKey);
    const publicKeyPem = await jose.exportSPKI(publicKey);

    // Display keys
    console.log('✅ Key pair generated successfully!\n');
    console.log('📝 Add these to your frontend/.env.local file:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Format private key for .env (escape newlines)
    const privateKeyEnv = privateKeyPem.replace(/\n/g, '\\n');
    console.log('JWT_PRIVATE_KEY="' + privateKeyEnv + '"');
    console.log('');

    // Format public key for .env (escape newlines)
    const publicKeyEnv = publicKeyPem.replace(/\n/g, '\\n');
    console.log('JWT_PUBLIC_KEY="' + publicKeyEnv + '"');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  SECURITY NOTES:');
    console.log('   - Keep the private key SECRET - never commit to git');
    console.log('   - Add .env.local to .gitignore (should already be there)');
    console.log('   - The public key can be shared (used only for verification)');
    console.log('   - Regenerate keys if the private key is ever compromised');
    console.log('');
    console.log('📋 Additional .env.local settings (optional):');
    console.log('');
    console.log('JWT_ACCESS_TOKEN_EXPIRES_IN=15m');
    console.log('JWT_REFRESH_TOKEN_EXPIRES_IN=7d');
    console.log('JWT_ISSUER=stat-discute.be');
    console.log('JWT_AUDIENCE=stat-discute-api');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Next steps:');
    console.log('   1. Copy the JWT_PRIVATE_KEY and JWT_PUBLIC_KEY to frontend/.env.local');
    console.log('   2. Restart your Next.js dev server (npm run dev)');
    console.log('   3. Test token generation with: npm test');
    console.log('');

    // Also save to a file for reference (with warning)
    const fs = require('fs');
    const path = require('path');
    const outputFile = path.join(__dirname, 'jwt-keys-GENERATED.txt');

    const fileContent = `# JWT Key Pair - Generated ${new Date().toISOString()}
# ⚠️ SECURITY WARNING: This file contains your PRIVATE KEY
# ⚠️ DELETE THIS FILE after copying keys to .env.local
# ⚠️ NEVER commit this file to git

# Add to frontend/.env.local:

JWT_PRIVATE_KEY="${privateKeyEnv}"

JWT_PUBLIC_KEY="${publicKeyEnv}"

# Optional configuration (defaults shown):
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_ISSUER=stat-discute.be
JWT_AUDIENCE=stat-discute-api

# Key characteristics:
# - Algorithm: EdDSA (Ed25519)
# - Private key format: PKCS8 PEM
# - Public key format: SPKI PEM
# - Token size: ~180 bytes (50% smaller than RS256)
# - Verification speed: Very fast (~10x faster than RS256)

# Security notes:
# - Keep private key secret at all times
# - Public key is safe to share (used only for verification)
# - Regenerate keys if private key is compromised
# - Never store private key in client-side code
`;

    fs.writeFileSync(outputFile, fileContent);
    console.log(`💾 Keys also saved to: ${outputFile}`);
    console.log('   ⚠️  DELETE THIS FILE after copying to .env.local\n');

  } catch (error) {
    console.error('❌ Error generating keys:', error);
    process.exit(1);
  }
})();
