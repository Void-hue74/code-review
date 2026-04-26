#!/usr/bin/env node

/**
 * Streaming Response Test
 * Verifies that the full code review is streamed correctly
 */

const http = require('http');

const testCode = `function sumArray(arr) { 
  let sum = 0; 
  for(let i = 0; i < arr.length; i++) { 
    sum += arr[i]; 
  } 
  return sum; 
}

function getUser(user) { 
  return user.name.toUpperCase(); 
}

let numbers = [1, 2, 3]; 
let user = null; 
console.log(sumArray(numbers)); 
console.log(getUser(user));`;

function testStreaming() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ code: testCode });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/ai/get-review-stream',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 60000
    };

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  STREAMING RESPONSE TEST                   ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const req = http.request(options, (res) => {
      let fullData = '';
      let chunkCount = 0;

      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers: Content-Type: ${res.headers['content-type']}\n`);
      console.log('Response Content:\n');
      console.log('─'.repeat(50));

      res.on('data', (chunk) => {
        fullData += chunk.toString();
        chunkCount++;
        process.stdout.write('.');
      });

      res.on('end', () => {
        console.log('\n' + '─'.repeat(50));
        console.log(`\n✓ Stream Complete`);
        console.log(`  Total Chunks: ${chunkCount}`);
        console.log(`  Total Size: ${fullData.length} characters`);
        
        if (fullData.length > 200) {
          console.log(`  ✓ Response is complete (>${200} chars)\n`);
          console.log('Full Response:\n');
          console.log(fullData);
          console.log(`\n✨ SUCCESS: Full streaming response received!\n`);
        } else if (fullData.includes('rate limit')) {
          console.log(`  ✗ Rate limited. Response: ${fullData}\n`);
        } else {
          console.log(`  ⚠️  WARNING: Response seems short (${fullData.length} chars)\n`);
          console.log('Response:\n');
          console.log(fullData);
        }

        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n❌ ERROR: ${e.message}\n`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('\n❌ TIMEOUT: Request took too long\n');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

testStreaming();
