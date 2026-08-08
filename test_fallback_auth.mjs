/**
 * Test script to verify fallback authentication works correctly
 */

const http = require('http');

// Test 1: Check health endpoint reports fallback mode
function testHealthEndpoint() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Health endpoint response:', result);
          resolve(result.authStore === 'development-fallback' ? 'PASS' : 'FAIL');
        } catch (e) {
          console.error('Failed to parse health response:', e);
          resolve('FAIL');
        }
      });
    }).on('error', (err) => {
      console.error('Health endpoint error:', err);
      resolve('FAIL');
    });
  });
}

// Test 2: Test login with fallback credentials
function testFallbackLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'frontoffice@erp.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Login response:', result);
          if (res.statusCode === 200 && result.user && result.user.email === 'frontoffice@erp.com') {
            resolve('PASS');
          } else {
            console.error('Login failed:', result);
            resolve('FAIL');
          }
        } catch (e) {
          console.error('Failed to parse login response:', e);
          resolve('FAIL');
        }
      });
    });

    req.on('error', (err) => {
      console.error('Login request error:', err);
      resolve('FAIL');
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Test login with invalid credentials
function testInvalidLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Invalid login response:', result);
          if (res.statusCode === 401 && result.error) {
            resolve('PASS');
          } else {
            console.error('Invalid login should have failed:', result);
            resolve('FAIL');
          }
        } catch (e) {
          console.error('Failed to parse invalid login response:', e);
          resolve('FAIL');
        }
      });
    });

    req.on('error', (err) => {
      console.error('Invalid login request error:', err);
      resolve('FAIL');
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== Testing Fallback Authentication ===\n');
  
  console.log('Test 1: Health endpoint');
  const test1 = await testHealthEndpoint();
  console.log(`Result: ${test1}\n`);
  
  console.log('Test 2: Valid fallback login');
  const test2 = await testFallbackLogin();
  console.log(`Result: ${test2}\n`);
  
  console.log('Test 3: Invalid login');
  const test3 = await testInvalidLogin();
  console.log(`Result: ${test3}\n`);
  
  const allPassed = [test1, test2, test3].every(t => t === 'PASS');
  console.log(`=== Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`);
  
  process.exit(allPassed ? 0 : 1);
}

runTests();