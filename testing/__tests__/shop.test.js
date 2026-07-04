jest.mock('../../backend/models/pokemon.model.js', () => ({
  PokemonModel: {
    findOwnedApiIdsByUserId: jest.fn(),
    findOrCreateShopItems: jest.fn(),
    purchaseShopItemForUser: jest.fn(),
    findPurchaseHistoryByUserId: jest.fn(),
  },
}));

import {
  buyPokemonHandler,
  getPurchaseHistoryHandler,
  getShopPokemonsHandler,
} from '../../backend/controllers/shop.controller.js';
import { PokemonModel } from '../../backend/models/pokemon.model.js';

const createResponse = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };

  return res;
};

describe('Shop Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('returns shop items with database-backed stock and owned state', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        results: [{ name: 'bulbasaur' }, { name: 'ivysaur' }],
      }),
    });
    PokemonModel.findOwnedApiIdsByUserId.mockResolvedValue([2]);
    PokemonModel.findOrCreateShopItems.mockResolvedValue(
      new Map([
        [1, { apiId: 1, name: 'bulbasaur', price: 40, rarity: 'common', stock: 12, isActive: true }],
        [2, { apiId: 2, name: 'ivysaur', price: 60, rarity: 'uncommon', stock: 7, isActive: true }],
      ])
    );

    const req = { user: { id: 42 } };
    const res = createResponse();

    await getShopPokemonsHandler(req, res);

    expect(PokemonModel.findOrCreateShopItems).toHaveBeenCalledWith([
      { apiId: 1, name: 'bulbasaur', price: 40, rarity: 'common', stock: 12 },
      { apiId: 2, name: 'ivysaur', price: 40, rarity: 'common', stock: 12 },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ apiId: 1, owned: false, price: 40, stock: 12 }),
        expect.objectContaining({ apiId: 2, owned: true, price: 60, stock: 7 }),
      ],
    });
  });

  it('delegates purchases to the transactional stock flow', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 4,
        name: 'charmander',
        types: [{ type: { name: 'fire' } }],
      }),
    });
    PokemonModel.findOwnedApiIdsByUserId.mockResolvedValue([]);
    PokemonModel.purchaseShopItemForUser.mockResolvedValue({
      newBalance: 60,
      pokemon: { id: 10, apiId: 4, name: 'charmander' },
      shopItem: { apiId: 4, price: 40, rarity: 'common', stock: 11 },
      user: { id: 42, nickname: 'Ash' },
    });

    const req = { user: { id: 42 }, body: { apiId: 4 } };
    const res = createResponse();

    await buyPokemonHandler(req, res);

    expect(PokemonModel.purchaseShopItemForUser).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        apiId: 4,
        name: 'charmander',
        type: 'fire',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        newBalance: 60,
        shopItem: expect.objectContaining({ stock: 11 }),
        purchase: expect.objectContaining({ price: 40, rarity: 'common' }),
      })
    );
  });

  it('returns stock errors from the transactional purchase flow', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 7,
        name: 'squirtle',
        types: [{ type: { name: 'water' } }],
      }),
    });
    PokemonModel.findOwnedApiIdsByUserId.mockResolvedValue([]);
    const error = new Error('This Pokemon is out of stock.');
    error.statusCode = 409;
    error.code = 'OUT_OF_STOCK';
    PokemonModel.purchaseShopItemForUser.mockRejectedValue(error);

    const req = { user: { id: 42 }, body: { apiId: 7 } };
    const res = createResponse();

    await buyPokemonHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'OUT_OF_STOCK',
        error: 'This Pokemon is out of stock.',
      })
    );
  });

  it('returns purchase history for the current user', async () => {
    PokemonModel.findPurchaseHistoryByUserId.mockResolvedValue([
      { apiId: 4, name: 'charmander', price: 40 },
    ]);

    const req = { user: { userId: 42 } };
    const res = createResponse();

    await getPurchaseHistoryHandler(req, res);

    expect(PokemonModel.findPurchaseHistoryByUserId).toHaveBeenCalledWith(42);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ apiId: 4, name: 'charmander', price: 40 }],
    });
  });
});
