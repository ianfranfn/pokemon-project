import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
        { duration: '1m', target: 50 }, // Stay at 50 users for 1 minute
        { duration: '30s', target: 100 }, // Ramp up to 100 users over 30 seconds
        { duration: '1m', target: 200 }, // Stay at 200 users for 1 minute
        { duration: '30s', target: 0 } // Ramp down to 0 users over 30 seconds
    ],
}

export default function () {
    const BASE_URL = __ENV.API_URL || 'http://18.191.190.137:3000'
    const TOKEN = __ENV.TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRvY2tlcl91c2VyQHRlc3QuY29tIiwiaWQiOjEsImlhdCI6MTc3MDU3MjgyMiwiZXhwIjoxNzcwNTc2NDIyfQ.b3nDoU1-Pmh7s_6VSCdmxSlfMbXsZ2zHG9M-0nW7hH0'
    // Define the API endpoint and request parameters
    const url = `${BASE_URL}/api/pokemon`
    const params = {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
    }
    // Send a GET request to the API endpoint
    const res = http.get(url, params)
    // Check that the response status is 200 and the response time is less than 500ms
    check(res, {
        'status is 200': (r) => r.status === 200,
        'tiempo respuesta < 500ms': (r) => r.timings.duration < 500,
    })
    // Wait 1 second between iterations to simulate user think time
    sleep(1)
}