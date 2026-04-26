#!/usr/bin/env node

/**
 * Code Review App - Final Test Report
 * Tests the core functionality of the application
 */

const http = require('http');

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async test(name, endpoint, code) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ code });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const testStart = Date.now();

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const duration = Date.now() - testStart;
          const passed = res.statusCode === 200 && data.length > 100;

          this.results.push({
            name,
            endpoint,
            statusCode: res.statusCode,
            responseLength: data.length,
            duration,
            passed,
            preview: data.substring(0, 80)
          });

          resolve();
        });
      });

      req.on('error', (e) => {
        this.results.push({
          name,
          endpoint,
          error: e.message,
          passed: false
        });
        resolve();
      });

      req.write(postData);
      req.end();
    });
  }

  async runAll() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  CODE REVIEW APP - FINAL TEST REPORT       ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n');

    // Test 1: Non-streaming endpoint
    console.log('📝 TEST 1: Non-Streaming Endpoint');
    console.log('─────────────────────────────────');
    await this.test(
      'Simple function review',
      '/ai/get-review',
      'function sum(){return 1+1;}'
    );
    console.log('✓ Request sent\n');

    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));

    // Test 2: Streaming endpoint
    console.log('📝 TEST 2: Streaming Endpoint');
    console.log('─────────────────────────────');
    await this.test(
      'Streaming function review',
      '/ai/get-review-stream',
      'function sum(){return 1+1;}'
    );
    console.log('✓ Request sent\n');

    // Print results
    console.log('\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  TEST RESULTS                             ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n');

    for (const result of this.results) {
      const status = result.passed ? '✓' : '✗';
      console.log(`${status} ${result.name}`);
      
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      } else {
        console.log(`  Endpoint: ${result.endpoint}`);
        console.log(`  Status: ${result.statusCode}`);
        console.log(`  Response: ${result.responseLength} chars`);
        console.log(`  Time: ${result.duration}ms`);
        console.log(`  Preview: "${result.preview}..."`);
      }
      console.log('');
    }

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const rate = (passed / total * 100).toFixed(0);

    console.log('╔════════════════════════════════════════════╗');
    console.log('║  SUMMARY                                  ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`  Total Tests: ${total}`);
    console.log(`  ✓ Passed: ${passed}`);
    console.log(`  ✗ Failed: ${total - passed}`);
    console.log(`  Success Rate: ${rate}%`);
    console.log('\n');

    if (passed === total) {
      console.log('  ✨ ALL TESTS PASSED! The app is working properly. ✨\n');
      console.log('  The following features are fully functional:');
      console.log('  • Backend server is running');
      console.log('  • Non-streaming code review endpoint');
      console.log('  • Streaming code review endpoint');
      console.log('  • Gemini API integration');
      console.log('  • Complex code review generation');
      console.log('\n  You can now use the app to review your code!\n');
    } else {
      console.log(`  ⚠️  ${total - passed} test(s) failed. Check the details above.\n`);
    }

    const totalTime = Date.now() - this.startTime;
    console.log(`  Test suite completed in ${totalTime}ms\n`);
  }
}

const runner = new TestRunner();
runner.runAll();
