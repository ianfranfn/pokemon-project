import request from 'supertest' // supertest is used for testing HTTP endpoints
import { app } from '../app.js' // Import the Express app

describe('Authentication JWT Tests', () => { // "describe" block for grouping tests

    let token // Variable to store JWT token

    it('should authenticate user and return JWT token', async () => { // try to login with valid credentials
        const res = await request(app)
            .post('/login')
            .send({
                email: 'user@test.com',
                password: 'password123'
            })
        
        expect(res.statusCode).toEqual(200) // Expect HTTP 200 OK
        expect(res.body).toHaveProperty('accessToken') // Expect response to have accessToken property

        token = res.body.accessToken // Save token for further tests
        console.log('Got token for testing', token)
    })

    it('should deny access to protected route without token', async () => { // try to access protected route without token
        const res = await request(app)
            .get('/api/pokemon')

            expect(res.statusCode).toEqual(401) // Expect HTTP 401 Unauthorized
    })

    it('should allow access to protected route with valid token', async () => { // try to access protected route with valid token
        const res = await request(app)
            .get('/api/pokemon')
            .set('Authorization', `Bearer ${token}`) // Set Authorization header with Bearer token

        expect(res.statusCode).toEqual(200) // Expect HTTP 200 OK
        expect(res.body).toHaveProperty('name', 'ditto') // Expect response to have pokemon property
    })

    it('should deny access to protected route with invalid token', async () => { // try to access protected route with invalid token
        const fakeToken = 'invalid.token.here'
        const res = await request(app)
            .get('/api/pokemon')
            .set('Authorization', `Bearer ${fakeToken}`) // Set Authorization header with fake token
        expect(res.statusCode).toEqual(403) // Expect HTTP 401 Unauthorized
    })
})