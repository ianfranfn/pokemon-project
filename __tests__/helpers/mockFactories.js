export const createUserModelMock = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'john@example.com',
  password_hash: 'hashed_password_123',
  ...overrides,
});