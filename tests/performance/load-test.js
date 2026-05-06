import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must be below 1000ms (1s)
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

const BASE_URL = 'https://bff-production-6364.up.railway.app/api/v1/products?page=1&limit=20';

export default function () {
  // Test Products API
  const productsRes = http.get(`${BASE_URL}/products?size=16`);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test Categories API
  const categoriesRes = http.get(`${BASE_URL}/categories`);
  check(categoriesRes, {
    'categories status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test Brands API
  const brandsRes = http.get(`${BASE_URL}/brands`);
  check(brandsRes, {
    'brands status is 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 3 + 1); // Think time between 1-4s
}
