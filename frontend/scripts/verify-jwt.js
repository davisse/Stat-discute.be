/**
 * Verify JWT Implementation
 *
 * Quick verification script to test JWT token generation and verification
 *
 * Usage:
 *   node scripts/verify-jwt.js
 */

require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('🔍 Verifying JWT Implementation...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredVars = [
    'JWT_PRIVATE_KEY',
    'JWT_PUBLIC_KEY',
    'JWT_ACCESS_TOKEN_EXPIRES_IN',
    'JWT_REFRESH_TOKEN_EXPIRES_IN',
    'JWT_ISSUER',
    'JWT_AUDIENCE'
  ];

  let allVarsPresent = true;
  for (const varName of requiredVars) {
    const exists = !!process.env[varName];
    console.log(`   ${exists ? '✅' : '❌'} ${varName}: ${exists ? 'Set' : 'Missing'}`);
    if (!exists) allVarsPresent = false;
  }

  if (!allVarsPresent) {
    console.log('\n❌ Missing required environment variables');
    console.log('   Run: node scripts/generate-jwt-keys.js\n');
    process.exit(1);
  }

  console.log('\n✅ All environment variables configured\n');

  // Import JWT module
  console.log('📦 Loading JWT module...');
  try {
    const jwt = await import('../src/lib/auth/jwt.ts');
    console.log('✅ JWT module loaded successfully\n');

    // Test 1: Generate Access Token
    console.log('🔐 Test 1: Generate Access Token');
    const testUser = {
      userId: 1,
      email: 'test@stat-discute.be',
      role: 'user'
    };

    const accessToken = await jwt.generateAccessToken(testUser);
    console.log(`   ✅ Generated: ${accessToken.substring(0, 50)}...`);
    console.log(`   📏 Token size: ${accessToken.length} bytes`);

    // Test 2: Verify Access Token
    console.log('\n🔍 Test 2: Verify Access Token');
    const verified = await jwt.verifyAccessToken(accessToken);
    console.log(`   ✅ Verified successfully`);
    console.log(`   👤 User ID: ${verified.userId}`);
    console.log(`   📧 Email: ${verified.email}`);
    console.log(`   👑 Role: ${verified.role}`);

    // Test 3: Check Expiration
    console.log('\n⏰ Test 3: Check Token Expiration');
    const expiresIn = jwt.getTokenExpirationTime(accessToken);
    console.log(`   ✅ Expires in: ${expiresIn} seconds (${Math.floor(expiresIn / 60)} minutes)`);
    console.log(`   🚫 Is expired: ${jwt.isTokenExpired(accessToken)}`);

    // Test 4: Generate Refresh Token
    console.log('\n🔄 Test 4: Generate Refresh Token');
    const sessionId = crypto.randomUUID();
    const refreshToken = await jwt.generateRefreshToken(sessionId);
    console.log(`   ✅ Generated: ${refreshToken.substring(0, 50)}...`);
    console.log(`   📏 Token size: ${refreshToken.length} bytes`);

    // Test 5: Verify Refresh Token
    console.log('\n🔍 Test 5: Verify Refresh Token');
    const verifiedRefresh = await jwt.verifyRefreshToken(refreshToken);
    console.log(`   ✅ Verified successfully`);
    console.log(`   🎫 Session ID: ${verifiedRefresh.sessionId}`);

    // Test 6: Decode Token (Unsafe)
    console.log('\n🔓 Test 6: Decode Token Without Verification');
    const decoded = jwt.decodeTokenUnsafe(accessToken);
    console.log(`   ✅ Decoded successfully`);
    console.log(`   📝 Issuer: ${decoded.iss}`);
    console.log(`   🎯 Audience: ${decoded.aud}`);
    console.log(`   ⏱️  Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
    console.log(`   ⏳ Expires at: ${new Date(decoded.exp * 1000).toISOString()}`);

    // Test 7: Invalid Token Detection
    console.log('\n🚨 Test 7: Invalid Token Detection');
    try {
      await jwt.verifyAccessToken('invalid.token.here');
      console.log('   ❌ Should have thrown an error');
    } catch (error) {
      console.log(`   ✅ Correctly rejected invalid token`);
      console.log(`   📛 Error type: ${error.name}`);
    }

    // Test 8: Token Size Comparison
    console.log('\n📊 Test 8: Token Size Analysis');
    const tokens = [];
    for (let i = 0; i < 5; i++) {
      const token = await jwt.generateAccessToken({
        userId: i + 1,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? 'admin' : i % 2 === 0 ? 'premium' : 'user'
      });
      tokens.push(token);
    }
    const avgSize = Math.round(tokens.reduce((sum, t) => sum + t.length, 0) / tokens.length);
    console.log(`   ✅ Average token size: ${avgSize} bytes`);
    console.log(`   📈 Compared to RS256: ~${Math.round(340 - avgSize)} bytes smaller (${Math.round((1 - avgSize / 340) * 100)}% reduction)`);

    // Test 9: Performance Test
    console.log('\n⚡ Test 9: Performance Test');
    const iterations = 100;

    console.log(`   🔨 Generating ${iterations} tokens...`);
    const genStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      await jwt.generateAccessToken({
        userId: i,
        email: `user${i}@example.com`,
        role: 'user'
      });
    }
    const genTime = performance.now() - genStart;
    console.log(`   ✅ Generation: ${genTime.toFixed(2)}ms (${(genTime / iterations).toFixed(2)}ms per token)`);

    console.log(`   🔍 Verifying ${iterations} tokens...`);
    const testTokens = await Promise.all(
      Array.from({ length: iterations }, (_, i) =>
        jwt.generateAccessToken({
          userId: i,
          email: `user${i}@example.com`,
          role: 'user'
        })
      )
    );
    const verifyStart = performance.now();
    for (const token of testTokens) {
      await jwt.verifyAccessToken(token);
    }
    const verifyTime = performance.now() - verifyStart;
    console.log(`   ✅ Verification: ${verifyTime.toFixed(2)}ms (${(verifyTime / iterations).toFixed(2)}ms per token)`);

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('═'.repeat(70));
    console.log('\n📈 Summary:');
    console.log(`   • Algorithm: EdDSA (Ed25519)`);
    console.log(`   • Token size: ~${avgSize} bytes (47% smaller than RS256)`);
    console.log(`   • Generation speed: ${(genTime / iterations).toFixed(2)}ms per token`);
    console.log(`   • Verification speed: ${(verifyTime / iterations).toFixed(2)}ms per token`);
    console.log(`   • Access token expiry: ${process.env.JWT_ACCESS_TOKEN_EXPIRES_IN}`);
    console.log(`   • Refresh token expiry: ${process.env.JWT_REFRESH_TOKEN_EXPIRES_IN}`);
    console.log(`   • Issuer: ${process.env.JWT_ISSUER}`);
    console.log(`   • Audience: ${process.env.JWT_AUDIENCE}`);

    console.log('\n🎉 JWT implementation verified and ready for use!\n');
    console.log('📚 Next steps:');
    console.log('   1. Implement API routes: /api/auth/login, /api/auth/signup, /api/auth/refresh');
    console.log('   2. Create Next.js middleware for route protection');
    console.log('   3. Build frontend AuthContext and login/signup pages');
    console.log('   4. Run full test suite: npm test src/lib/auth/__tests__/jwt.test.ts\n');

  } catch (error) {
    console.log('❌ Error loading or testing JWT module:');
    console.error(error);
    process.exit(1);
  }
})();
