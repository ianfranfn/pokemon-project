import http from 'k6/http'

export default function () {
    const url = 'http://18.191.190.137:3000/api/pokemon'
    const params = {
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRvY2tlcl91c2VyQHRlc3QuY29tIiwiaWQiOjEsImlhdCI6MTc3MDU3MjgyMiwiZXhwIjoxNzcwNTc2NDIyfQ.b3nDoU1-Pmh7s_6VSCdmxSlfMbXsZ2zHG9M-0nW7hH0',
            'Content-Type': 'application/json',
        },
    }
    const res = http.get(url, params)

    console.log(`Status code: ${res.status}`);
    console.log(`Response body: ${res.body}`);
    
    
}