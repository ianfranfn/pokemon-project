jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('../models/user.model.js', () => ({
  UserModel: {
    findByEmail: jest.fn(),
    create: jest.fn()
  }
}))
import { loginHandler, registerHandler } from '../controllers/auth.controller.js' // Imports the function to test
import { UserModel } from '../models/user.model.js'; // Imports the Model to mock
import { createMockUser } from './helpers/mockFactories.js' // Helper to create fake users
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

describe('Auth Controller - Unit Tests', () => {

  let mockReq
  let mockRes
  let mockUser

  // Before EACH test, reset the fake objects
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Fake 'req' (request) object
    mockReq = {
      body: {
        email: 'test@user.com',
        password: '123456'
      }
    }

    // Create jest.fn() functions to "spy" if they are called
    mockRes = {
      status: jest.fn(() => mockRes), // Allows chaining .status().json()
      json: jest.fn(),
    }

    // A fake user that the DB will "return"
    mockUser = createMockUser({
      email: 'test@user.com',
      password_hash: 'hash_super_secreto'
    })
  })

  it('should return 200 and JWT token on successful login', async () => {

    // Fake that the user DOES exist
    UserModel.findByEmail.mockResolvedValue(mockUser)
    // Fake that the password DOES match
    bcrypt.compare.mockResolvedValue(true)
    // Fake that the token is signed
    jwt.sign.mockReturnValue('mi.token.falso.jwt')

    // Call the function (the "Handler") directly
    await loginHandler(mockReq, mockRes)

    // Check the results
    expect(UserModel.findByEmail).toHaveBeenCalledWith('test@user.com')
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash_super_secreto')
    expect(mockRes.json).toHaveBeenCalledWith({ accessToken: 'mi.token.falso.jwt' })
  })

  it('should return 401 if user is not found', async () => {
    // Fake that the user does NOT exist
    UserModel.findByEmail.mockResolvedValue(null)

    // Call the handler
    await loginHandler(mockReq, mockRes)

    expect(UserModel.findByEmail).toHaveBeenCalledWith('test@user.com')
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email or password' })
  })

  it('should return 401 if password does not match', async () => {

    // Fake that the user DOES exist
    UserModel.findByEmail.mockResolvedValue(mockUser)
    // Fake that the password does NOT match
    bcrypt.compare.mockResolvedValue(false)

    // Call the handler
    await loginHandler(mockReq, mockRes)

    // Check
    expect(UserModel.findByEmail).toHaveBeenCalledWith('test@user.com')
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash_super_secreto')
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email or password' })
  })
})

describe('Auth Controller - Register Unit Tests', () => { // New test suite for registration
    let mockReq
    let mockRes
    const testEmail = 'newuser@register.com'
    const testPassword = 'securepassword'
    
    beforeEach(() => { // Reset before each test
        jest.clearAllMocks()
        mockReq = {
            body: { email: testEmail, password: testPassword }
        }
        mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        }
    })
    it('should return 201 and success message on successful registration', async () => { // Test successful registration
        UserModel.findByEmail.mockResolvedValue(null)
        bcrypt.hash.mockResolvedValue('hashed_password')
        UserModel.create.mockResolvedValue({ id: 2, email: testEmail })

        await registerHandler(mockReq, mockRes)

        expect(UserModel.create).toHaveBeenCalledWith({ email: testEmail, passwordHash: 'hashed_password' })
        expect(mockRes.status).toHaveBeenCalledWith(201)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User registered successfully' }))
    })

    it('should return 409 if the user already exists', async () => { // Test registration with existing email
        const existingUser = { id: 1, email: testEmail }
        UserModel.findByEmail.mockResolvedValue(existingUser)

        await registerHandler(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(409)
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'User already exists' })
        expect(UserModel.create).not.toHaveBeenCalled()
    })

    it('should return 400 if email or password are missing', async () => { // Test registration with missing fields
        mockReq.body.password = undefined // Missing password

        await registerHandler(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email and password are required for registration' })
    })
})

