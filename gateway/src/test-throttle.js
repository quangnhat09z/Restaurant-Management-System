const http = require('http');

async function makeRequest(n) {
  return new Promise((resolve) => {
    // Test data - Order with UserID for throttling
    const postData = JSON.stringify(
      {
        "UserID": 134,
        "UserName": "MT Quang Nhat",
        "ContactNumber": "0868194229",
        "TableNumber": 5,
        "Cart": [
          {
            "id": 2,
            "name": "Sinh tố bơ",
            "Quantity": 1,
            "price": 10000
          }
        ]
      });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/orders/',
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
        console.log(`Request ${n}: Status ${res.statusCode}`);
        if (res.statusCode === 429) {
          console.log(`  ⚠️  THROTTLED!`, data);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.error(`Request ${n}: Error -`, e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('🔥 Testing order throttling (max 3 orders per minute per user)...\n');
  for (let i = 1; i <= 5; i++) {
    await makeRequest(i);
    await new Promise(r => setTimeout(r, 100)); // 100ms delay between requests
  }
  console.log('\n✅ Test completed');
}

test();