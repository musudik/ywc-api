const newman = require('newman');
const path = require('path');

// Configuration
const COLLECTION_PATH = path.join(__dirname, 'YWC-Financial-Forms-API.postman_collection.json');
const ENVIRONMENT_PATH = path.join(__dirname, 'YWC-Development.postman_environment.json');

// Run the collection
function runTests() {
  console.log('🧪 Running YWC Financial Forms API Tests...\n');

  newman.run({
    collection: COLLECTION_PATH,
    environment: ENVIRONMENT_PATH,
    reporters: ['cli', 'json'],
    reporter: {
      json: {
        export: path.join(__dirname, 'test-results.json')
      }
    },
    iterationCount: 1,
    timeout: 30000,
    timeoutRequest: 10000,
    insecure: true, // Allow self-signed certificates in development
    bail: false, // Continue running tests even if one fails
  }, function (err, summary) {
    if (err) {
      console.error('❌ Newman run failed:', err);
      process.exit(1);
    }

    console.log('\n📊 Test Summary:');
    console.log(`Total: ${summary.run.stats.requests.total}`);
    console.log(`Passed: ${summary.run.stats.requests.total - summary.run.stats.requests.failed}`);
    console.log(`Failed: ${summary.run.stats.requests.failed}`);
    console.log(`Response Time: ${summary.run.timings.responseAverage}ms avg`);

    if (summary.run.stats.requests.failed > 0) {
      console.log('\n❌ Some tests failed');
      
      // Print failed test details
      summary.run.executions.forEach((execution, index) => {
        if (execution.assertions && execution.assertions.length > 0) {
          execution.assertions.forEach((assertion) => {
            if (assertion.error) {
              console.log(`\n❌ ${execution.item.name}:`);
              console.log(`   ${assertion.error.message}`);
            }
          });
        }
      });
      
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  });
}

// Check if server is running before starting tests
const http = require('http');
const url = require('url');

function checkServer(callback) {
  const serverUrl = 'http://localhost:3000/health';
  const parsedUrl = url.parse(serverUrl);
  
  const req = http.request({
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: 'GET',
    timeout: 5000
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server is running and accessible');
      callback(true);
    } else {
      console.log(`❌ Server responded with status: ${res.statusCode}`);
      callback(false);
    }
  });

  req.on('error', (err) => {
    console.log('❌ Server is not accessible:', err.message);
    console.log('💡 Make sure the server is running with: npm start');
    callback(false);
  });

  req.on('timeout', () => {
    console.log('❌ Server request timed out');
    callback(false);
  });

  req.end();
}

// Main execution
console.log('🔍 Checking if API server is running...');
checkServer((isRunning) => {
  if (isRunning) {
    runTests();
  } else {
    console.log('\n💡 To start the server, run: npm start');
    process.exit(1);
  }
}); 