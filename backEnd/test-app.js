const http = require('http');

const tests = [
  {
    name: 'Test 1: Simple function review',
    code: 'function sum(){return 1+1;}'
  },
  {
    name: 'Test 2: Function with parameters',
    code: 'function add(a, b) { return a + b; }'
  },
  {
    name: 'Test 3: Async function',
    code: 'async function fetchData(url) { const res = await fetch(url); return res.json(); }'
  },
  {
    name: 'Test 4: Class definition',
    code: 'class User { constructor(name) { this.name = name; } getName() { return this.name; } }'
  },
  {
    name: 'Test 5: Promise-based function',
    code: 'function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }'
  }
];

let testIndex = 0;
let passedTests = 0;
let failedTests = 0;

function testNonStreaming(code, testName) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ code });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/ai/get-review',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n✓ ${testName}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response length: ${data.length} characters`);
        
        if (data.length > 100) {
          console.log(`  Preview: ${data.substring(0, 100)}...`);
          passedTests++;
        } else {
          console.log(`  ✗ ERROR: Response too short (${data.length} chars)`);
          failedTests++;
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n✗ ${testName} - ERROR: ${e.message}`);
      failedTests++;
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

function testStreaming(code, testName) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ code });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/ai/get-review-stream',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      let chunkCount = 0;

      res.on('data', (chunk) => {
        data += chunk.toString();
        chunkCount++;
      });

      res.on('end', () => {
        console.log(`\n✓ ${testName} (Streaming)`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Total response length: ${data.length} characters`);
        console.log(`  Chunks received: ${chunkCount}`);
        
        if (data.length > 200) {
          console.log(`  Preview: ${data.substring(0, 100)}...`);
          passedTests++;
        } else {
          console.log(`  ✗ ERROR: Response too short (${data.length} chars)`);
          failedTests++;
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n✗ ${testName} (Streaming) - ERROR: ${e.message}`);
      failedTests++;
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Code Review App - Test Suite\n');
  console.log('================================\n');

  for (const test of tests) {
    console.log(`\n📝 Running: ${test.name}`);
    console.log('---');
    
    // Test non-streaming
    await testNonStreaming(test.code, `${test.name} (Non-streaming)`);
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n================================');
  console.log(`📊 Test Summary`);
  console.log('================================');
  console.log(`Total tests: ${passedTests + failedTests}`);
  console.log(`✓ Passed: ${passedTests}`);
  console.log(`✗ Failed: ${failedTests}`);
  console.log(`Success rate: ${(passedTests / (passedTests + failedTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n✨ All tests passed! The app is working properly.\n');
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please check the errors above.\n`);
  }
}

runTests();
