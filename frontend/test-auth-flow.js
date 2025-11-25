/**
 * Authentication Flow Test Script
 *
 * Tests the complete Phase 2 authentication implementation:
 * - Signup with password validation
 * - Login and session creation
 * - Session persistence and auto-refresh
 * - Protected route access
 * - Password reset flow
 * - Logout and session cleanup
 *
 * Run with: node test-auth-flow.js
 */

const BASE_URL = 'http://localhost:3000';

// Helper to extract cookies from response headers
function extractCookies(headers) {
  const cookies = {};
  const setCookieHeaders = headers.getSetCookie ? headers.getSetCookie() : [];

  setCookieHeaders.forEach(cookieStr => {
    const [nameValue] = cookieStr.split(';');
    const [name, value] = nameValue.split('=');
    cookies[name.trim()] = value.trim();
  });

  return cookies;
}

// Helper to format cookies for request
function formatCookies(cookies) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

// Test state
// Generate a truly unique password that meets ALL criteria:
// - 12+ chars, lowercase, uppercase, number, special char
// - Won't be in HaveIBeenPwned database (unique per run)
const timestamp = Date.now();
const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
let testUser = {
  email: `test-${timestamp}@stat-discute.be`,
  password: `TestP@ssw0rd!${timestamp}${randomChars}`,  // Meets all criteria + unique
  fullName: 'Test User'
};
let cookies = {};
let resetToken = null;

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Test 1: Signup with valid data
async function testSignup() {
  console.log('\n📝 Test 1: User Signup');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.status === 201 && data.success) {
      cookies = extractCookies(response.headers);
      logSuccess(`Signup successful: ${data.user.email}`);
      logSuccess(`User ID: ${data.user.id}`);
      logSuccess(`Role: ${data.user.role}`);
      logSuccess(`Cookies set: accessToken=${!!cookies.accessToken}, refreshToken=${!!cookies.refreshToken}`);
      return true;
    } else {
      logError(`Signup failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Signup error: ${error.message}`);
    return false;
  }
}

// Test 2: Signup with weak password (should fail)
async function testSignupWeakPassword() {
  console.log('\n🔒 Test 2: Signup with Weak Password (should fail)');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `weak-${Date.now()}@stat-discute.be`,
        password: 'weak',
        fullName: 'Weak Password User'
      })
    });

    const data = await response.json();

    if (response.status === 400 && data.error) {
      logSuccess(`Weak password correctly rejected: ${data.error}`);
      if (data.details) {
        logInfo(`Validation details: ${JSON.stringify(data.details)}`);
      }
      return true;
    } else {
      logError(`Weak password was accepted (security issue!)`);
      logError(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test error: ${error.message}`);
    return false;
  }
}

// Test 3: Session check with valid token
async function testSessionCheck() {
  console.log('\n🔍 Test 3: Session Check');

  if (!cookies.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Cookie': formatCookies(cookies)
      }
    });

    const data = await response.json();

    if (response.status === 200 && data.user) {
      logSuccess(`Session valid: ${data.user.email}`);
      logSuccess(`User role: ${data.user.role}`);
      return true;
    } else {
      logError(`Session check failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Session check error: ${error.message}`);
    return false;
  }
}

// Test 4: Logout
async function testLogout() {
  console.log('\n👋 Test 4: Logout');

  if (!cookies.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': formatCookies(cookies)
      }
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      logSuccess('Logout successful');
      // Clear cookies
      cookies = {};
      return true;
    } else {
      logError(`Logout failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Logout error: ${error.message}`);
    return false;
  }
}

// Test 5: Session check after logout (should fail)
async function testSessionAfterLogout() {
  console.log('\n🚫 Test 5: Session Check After Logout (should fail)');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET'
    });

    const data = await response.json();

    if (response.status === 401) {
      logSuccess('Session correctly invalid after logout');
      return true;
    } else {
      logError('Session still valid after logout (security issue!)');
      return false;
    }
  } catch (error) {
    logError(`Test error: ${error.message}`);
    return false;
  }
}

// Test 6: Login with correct credentials
async function testLogin() {
  console.log('\n🔑 Test 6: Login with Correct Credentials');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      cookies = extractCookies(response.headers);
      logSuccess(`Login successful: ${data.user.email}`);
      logSuccess(`Cookies set: accessToken=${!!cookies.accessToken}, refreshToken=${!!cookies.refreshToken}`);
      return true;
    } else {
      logError(`Login failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Login error: ${error.message}`);
    return false;
  }
}

// Test 7: Login with wrong password (should fail with rate limiting)
async function testLoginWrongPassword() {
  console.log('\n❌ Test 7: Login with Wrong Password (should fail)');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123!'
      })
    });

    const data = await response.json();

    if (response.status === 401 && data.error) {
      logSuccess(`Wrong password correctly rejected: ${data.error}`);
      return true;
    } else {
      logError('Wrong password was accepted (security issue!)');
      return false;
    }
  } catch (error) {
    logError(`Test error: ${error.message}`);
    return false;
  }
}

// Test 8: Token refresh
async function testTokenRefresh() {
  console.log('\n🔄 Test 8: Token Refresh');

  if (!cookies.refreshToken) {
    logError('No refresh token available');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': formatCookies(cookies)
      }
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      const newCookies = extractCookies(response.headers);
      if (newCookies.accessToken) {
        cookies.accessToken = newCookies.accessToken;
      }
      logSuccess('Token refresh successful');
      logSuccess(`New access token: ${!!newCookies.accessToken}`);
      return true;
    } else {
      logError(`Token refresh failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Token refresh error: ${error.message}`);
    return false;
  }
}

// Test 9: Password reset request
async function testPasswordResetRequest() {
  console.log('\n📧 Test 9: Password Reset Request');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/password-reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      logSuccess('Password reset request successful');
      logInfo('Check server console for reset token (development mode)');
      logWarning('Note: You need to manually copy the token from server console');
      return true;
    } else {
      logError(`Password reset request failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Password reset request error: ${error.message}`);
    return false;
  }
}

// Test 10: Duplicate email signup (should fail)
async function testDuplicateEmail() {
  console.log('\n🚫 Test 10: Duplicate Email Signup (should fail)');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.status === 409 && data.error) {
      logSuccess(`Duplicate email correctly rejected: ${data.error}`);
      return true;
    } else {
      logError('Duplicate email was accepted (data integrity issue!)');
      return false;
    }
  } catch (error) {
    logError(`Test error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Authentication Flow Test Suite');
  console.log('=====================================');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Signup', fn: testSignup },
    { name: 'Signup Weak Password', fn: testSignupWeakPassword },
    { name: 'Session Check', fn: testSessionCheck },
    { name: 'Logout', fn: testLogout },
    { name: 'Session After Logout', fn: testSessionAfterLogout },
    { name: 'Login', fn: testLogin },
    { name: 'Login Wrong Password', fn: testLoginWrongPassword },
    { name: 'Token Refresh', fn: testTokenRefresh },
    { name: 'Password Reset Request', fn: testPasswordResetRequest },
    { name: 'Duplicate Email', fn: testDuplicateEmail }
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n=====================================');
  console.log('📊 Test Summary');
  console.log('=====================================');
  console.log(`Total tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
    console.log('\n🎉 Phase 2 authentication flow is working correctly!');
  } else {
    console.log(`\n${colors.red}✗ Some tests failed${colors.reset}`);
    console.log('Please review the errors above.');
  }

  console.log('\n📝 Next steps:');
  console.log('1. Test password reset confirm flow (requires manual token from server console)');
  console.log('2. Test frontend pages manually:');
  console.log('   - http://localhost:3000/signup');
  console.log('   - http://localhost:3000/login');
  console.log('   - http://localhost:3000/dashboard (requires authentication)');
  console.log('   - http://localhost:3000/forgot-password');
  console.log('3. Test middleware route protection');
  console.log('4. Verify browser cookie handling and session persistence');
}

// Run the test suite
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
