import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 }, // Ramp up to 200 users over 1 minute
    { duration: '1m', target: 500 }, // Stay at 500 users for 1 minute
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users over 2min
    { duration: '2m', target: 2000 }, // Stay at 2000 users for 2min
    { duration: '30s', target: 0 }, // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Fail if more than 1% of requests fail
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2 seconds
  },
};

export default function () {
  const BASE_URL = __ENV.API_URL;
  const TOKEN = __ENV.TOKEN;

  if (!BASE_URL || !TOKEN) {
    throw new Error('API_URL and TOKEN environment variables are required');
  }
  // Define the API endpoint and request parameters
  const url = `${BASE_URL}/api/pokemon`;
  const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  // Send a GET request to the API endpoint
  const res = http.get(url, params);
  // Check that the response status is 200 and the response time is less than 500ms
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  // Wait 1 second between iterations to simulate user think time
  sleep(0.5);
}
