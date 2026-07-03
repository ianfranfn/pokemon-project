import http from 'k6/http';

export default function () {
  const BASE_URL = __ENV.API_URL;
  const TOKEN = __ENV.TOKEN;

  if (!BASE_URL || !TOKEN) {
    throw new Error('API_URL and TOKEN environment variables are required');
  }

  const url = `${BASE_URL}/api/pokemon`;
  const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  const res = http.get(url, params);

  console.log(`Status code: ${res.status}`);
  console.log(`Response body: ${res.body}`);
}
