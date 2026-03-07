import request from 'supertest'
import { app } from '../../app.js'
import { UserModel } from '../../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createMockUser } from '../helpers/mockFactories.js'
import * as clients from "@restatedev/restate-sdk-clients"

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('../../models/user.model.js', () => ({
    UserModel: {
        findByEmail: jest.fn(),
        create: jest.fn()
    }
}))
jest.mock("@restatedev/restate-sdk-clients", () => ({
    connect: jest.fn().mockReturnValue({
        serviceSendClient: jest.fn().mockReturnValue({
            sendWelcomeEmail: jest.fn().mockResolvedValue({ invocationId: "test-id" })
        })
    })
}))

describe('Auth Integration Tests - /login', () => {
    let mockUser

    beforeEach(() => {
        jest.clearAllMocks()

        mockUser = createMockUser({
            email: 'test@integration.com',
            password_hash: 'hashed_password_123'
        })
    })

    it('should return 200 and JWT token on successful login (integration)', async () => {
        UserModel.findByEmail.mockResolvedValue(mockUser)
        bcrypt.compare.mockResolvedValue(true)
        jwt.sign.mockReturnValue('mocked_jwt_token')

        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@integration.com',
                password: 'password123'
            })

            expect(response.statusCode).toBe(200)
            expect(response.body).toHaveProperty('accessToken', 'mocked_jwt_token')
            expect(UserModel.findByEmail).toHaveBeenCalledWith('test@integration.com')
    })
    it('should return 401 if user is not found (integration)', async () => {
        UserModel.findByEmail.mockResolvedValue(null)

        const response = await request(app)
            .post('/login')
            .send({
                email: 'nonexistent@integration.com',
                password: 'password123'
            })

            expect(response.statusCode).toBe(401)
            expect(response.body).toHaveProperty('error', 'Invalid email or password')
    })
    describe('POST /register', () => {
        it("should call Restate EmailService when a user is successfully registered", async () => {
            UserModel.findByEmail.mockResolvedValue(null);
            UserModel.create.mockResolvedValue({ id: 1, email: "test-restate@example.com" });

            const newUser = { email: "test-restate@example.com", password: "password123" }
            const response = await request(app)
                .post("/register")
                .send(newUser);

            expect(response.status).toBe(201);
            
            const mockConnect = clients.connect;
            expect(mockConnect).toHaveBeenCalledWith({ url: "http://restate:8080" });
        })
    })
})