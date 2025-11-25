/**
 * Debug Script for Cookie Handling
 * Tests cookie extraction and session validation
 */

const BASE_URL = 'http://localhost:3000';

// Helper to extract cookies from response headers
function extractCookies(headers) {
  const cookies = {};
  const setCookieHeaders = headers.getSetCookie ? headers.getSetCookie() : [];

  console.log('📋 Raw Set-Cookie headers:', setCookieHeaders);

  setCookieHeaders.forEach(cookieStr => {
    const [nameValue] = cookieStr.split(';');
    const [name, value] = nameValue.split('=');
    cookies[name.trim()] = value.trim();
  });

  console.log('🍪 Extracted cookies:', cookies);
  return cookies;
}

// Helper to format cookies for request
function formatCookies(cookies) {
  const formatted = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  console.log('📤 Formatted cookie string:', formatted);
  return formatted;
}

async function debugCookieFlow() {
  console.log('🧪 Cookie Handling Debug\n');

  // Step 1: Signup
  console.log('Step 1: Signup');
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const testUser = {
    email: `debug-${timestamp}@stat-discute.be`,
    password: `TestP@ssw0rd!${timestamp}${randomChars}`,
    fullName: 'Debug User'
  };

  const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testUser)
  });

  console.log('✅ Signup status:', signupResponse.status);
  const signupData = await signupResponse.json();
  console.log('✅ Signup data:', signupData);

  const cookies = extractCookies(signupResponse.headers);
  console.log('✅ Cookies available:', Object.keys(cookies));

  // Step 2: Session check
  console.log('\nStep 2: Session Check');
  console.log('📋 Cookies to send:', cookies);

  const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
    method: 'GET',
    headers: {
      'Cookie': formatCookies(cookies)
    }
  });

  console.log('✅ Session check status:', sessionResponse.status);
  const sessionData = await sessionResponse.json();
  console.log('✅ Session check data:', sessionData);

  // Step 3: Verify cookies are still present
  console.log('\nStep 3: Cookie Persistence Check');
  console.log('🍪 Cookies object after session check:', cookies);
}

debugCookieFlow().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
