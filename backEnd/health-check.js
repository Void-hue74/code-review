#!/usr/bin/env node

/**
 * Quick Health Check - Code Review App
 * Single endpoint test to verify app is functional
 */

const http = require('http');

function healthCheck() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ 
      code: 'function multiply(a, b) { return a * b; }' 
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/ai/get-review',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║  HEALTH CHECK - CODE REVIEW APP            ║');
        console.log('╚════════════════════════════════════════════╝\n');

        if (res.statusCode === 200 && data.length > 200) {
          console.log('✨ STATUS: HEALTHY\n');
          console.log('✓ Backend server is running');
          console.log('✓ API endpoint responding correctly');
          console.log('✓ Gemini integration working');
          console.log('✓ Code review generation successful\n');
          console.log(`Response Details:`);
          console.log(`  Status Code: ${res.statusCode}`);
          console.log(`  Response Size: ${data.length} characters`);
          console.log(`  Preview: ${data.substring(0, 100)}...\n`);
          console.log('✨ The app is ready to use!\n');
        } else if (res.statusCode === 429) {
          console.log('⏳ STATUS: RATE LIMITED\n');
          console.log('The API is currently rate-limited.');
          console.log('Please wait a minute and try again.\n');
          console.log('Rate Limit: 10 requests per minute\n');
        } else {
          console.log('⚠️  STATUS: ISSUE DETECTED\n');
          console.log(`Status Code: ${res.statusCode}`);
          console.log(`Response: ${data}\n`);
        }

        resolve();
      });
    });

    req.on('error', (e) => {
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║  HEALTH CHECK - CODE REVIEW APP            ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log(`❌ STATUS: ERROR\n`);
      console.log(`Error: ${e.message}\n`);
      console.log('Make sure the backend server is running:\n');
      console.log('  cd /Users/abhinavrawat/Desktop/Code-Review/backEnd');
      console.log('  node server.js\n');
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('\n❌ STATUS: TIMEOUT\n');
      console.log('Server did not respond within 30 seconds\n');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

healthCheck();
