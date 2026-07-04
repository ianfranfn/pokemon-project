jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../backend/models/user.model.js', () => ({
  UserModel: {
    findByIdentifier: jest.fn(),
  },
}));
jest.mock('../../backend/models/pokemon.model.js', () => ({
  PokemonModel: {
    findAllByUserId: jest.fn(),
    findOwnedApiIdsByUserId: jest.fn(),
  },
}));
jest.mock('../../backend/models/emailLog.model.js', () => ({
  EmailLogModel: {
    create: jest.fn(),
  },
}));
jest.mock('@restatedev/restate-sdk-clients', () => ({
  connect: jest.fn(),
}));

import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../../backend/app.js';
import { UserModel } from '../../backend/models/user.model.js';
import { PokemonModel } from '../../backend/models/pokemon.model.js';

describe('API route wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps auth routes mounted at the root', async () => {
    UserModel.findByIdentifier.mockResolvedValue({
      id: 42,
      email: 'ash@example.com',
      nickname: 'Ash',
      password_hash: 'hash',
      coins: 100,
      last_login_date: new Date().toISOString().split('T')[0],
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');

    const response = await request(app).post('/login').send({
      identifier: 'ash@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken', 'token');
  });

  it('keeps Pokemon routes mounted under /api/pokemon', async () => {
    jwt.verify.mockReturnValue({ id: 42, email: 'ash@example.com' });
    PokemonModel.findAllByUserId.mockResolvedValue({
      rows: [{ id: 1, name: 'Bulbasaur' }],
      totalItems: 1,
    });

    const response = await request(app)
      .get('/api/pokemon')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([{ id: 1, name: 'Bulbasaur' }]);
  });

  it('keeps shop routes mounted under /shop', async () => {
    jwt.verify.mockReturnValue({ id: 42, email: 'ash@example.com' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ results: [] }),
    });
    PokemonModel.findOwnedApiIdsByUserId.mockResolvedValue([]);
    PokemonModel.findOrCreateShopItems = jest.fn().mockResolvedValue(new Map());

    const response = await request(app).get('/shop').set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });

    delete global.fetch;
  });
});
