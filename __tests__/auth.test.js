jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('../models/pokemon.model.js', () => ({
  PokemonModel: {
    findAllByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  }
}))
jest.mock('../models/user.model.js', () => ({
  UserModel: {
    findByEmail: jest.fn(),
    create: jest.fn()
  }
}))
import { loginHandler, registerHandler } from '../controllers/auth.controller.js' // Imports the function to test
import { PokemonModel } from '../models/pokemon.model.js'
import { updatePokemonHandler, deletePokemonHandler } from '../controllers/pokemon.controller.js'
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

describe('Pokemon Controller - CRUD Unit Tests', () => {
  let mockReq
  let mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockReq = {
      params: { id: 101 },
      body: { name: 'Pikachu' },
      user: { id: 42 }
    }
    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
      send: jest.fn(), 
    }
  })

  it('shold return 200 on successful pokemon update', async () => {
    PokemonModel.update.mockResolvedValue(true)

    await updatePokemonHandler(mockReq, mockRes)

    expect(PokemonModel.update).toHaveBeenCalledWith(101, { name: 'Pikachu' })
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Pokemon updated successfully' })
  })

  it('should return 404 if pokemon update fails or not found', async () => {
    PokemonModel.update.mockResolvedValue(false)

    await updatePokemonHandler(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404)
  })

  it('should return 204 on successful pokemon deletion', async () => {
    PokemonModel.delete.mockResolvedValue(true)

    await deletePokemonHandler(mockReq, mockRes)

    expect(PokemonModel.delete).toHaveBeenCalledWith(101)
    expect(mockRes.status).toHaveBeenCalledWith(204)
    expect(mockRes.send).toHaveBeenCalled()
  })

  it('should return 404 if pokemon deletion fails or not found', async () => {
    PokemonModel.delete.mockResolvedValue(false)

    await deletePokemonHandler(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.send).not.toHaveBeenCalled()
  })
})
