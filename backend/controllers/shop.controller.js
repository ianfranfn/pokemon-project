import logger from '../utils/logger.js';
import { PokemonModel } from '../models/pokemon.model.js';

const SHOP_LIMIT = 20;

const buildPokemonImageUrl = (name) => `https://img.pokemondb.net/sprites/home/normal/${name}.png`;

const getRarityForApiId = (apiId) => {
  if (apiId % 20 === 0) {
    return 'epic';
  }

  if (apiId % 10 === 0) {
    return 'rare';
  }

  if (apiId % 5 === 0) {
    return 'uncommon';
  }

  return 'common';
};

const getPriceForRarity = (rarity) => {
  const prices = {
    common: 40,
    uncommon: 60,
    rare: 90,
    epic: 120,
  };

  return prices[rarity] || prices.common;
};

const getBaseStockForApiId = (apiId) => {
  if (apiId % 17 === 0) {
    return 0;
  }

  const stockByRarity = {
    common: 12,
    uncommon: 8,
    rare: 4,
    epic: 2,
  };

  return stockByRarity[getRarityForApiId(apiId)];
};

const getShopMetadata = (apiId) => {
  const rarity = getRarityForApiId(apiId);

  return {
    rarity,
    price: getPriceForRarity(rarity),
    stock: getBaseStockForApiId(apiId),
  };
};

const normalizeShopPokemon = (pokemon) => ({
  apiId: pokemon.id,
  name: pokemon.name,
  type: pokemon.types.map((slot) => slot.type.name).join('/'),
  image: buildPokemonImageUrl(pokemon.name),
});

const fetchPokemonByApiId = async (apiId) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiId}`);

  if (!response.ok) {
    throw new Error('Error fetching Pokemon from external API');
  }

  const data = await response.json();
  return normalizeShopPokemon(data);
};

export const getShopPokemonsHandler = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${SHOP_LIMIT}&offset=0`);

    if (!response.ok) {
      throw new Error('Error fetching Pokemon from external API');
    }

    const data = await response.json();
    const ownedApiIds = new Set(await PokemonModel.findOwnedApiIdsByUserId(userId));
    const defaultItems = data.results.map((pkm, index) => ({
      apiId: index + 1,
      name: pkm.name,
      ...getShopMetadata(index + 1),
    }));
    const shopItemsByApiId = await PokemonModel.findOrCreateShopItems(defaultItems);

    const shopItems = data.results.map((pkm, index) => {
      const apiId = index + 1;
      const shopItem = shopItemsByApiId.get(apiId) || defaultItems[index];

      return {
        apiId,
        name: pkm.name,
        price: shopItem.price,
        rarity: shopItem.rarity,
        stock: shopItem.stock,
        isActive: shopItem.isActive ?? true,
        image: buildPokemonImageUrl(pkm.name),
        owned: ownedApiIds.has(apiId),
      };
    });

    return res.status(200).json({ data: shopItems });
  } catch (error) {
    logger.error('Error fetching shop items:', error);
    return res.status(500).json({ error: 'Internal server error fetching shop' });
  }
};

export const buyPokemonHandler = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const normalizedApiId = Number(req.body.apiId);

  if (!Number.isInteger(normalizedApiId) || normalizedApiId < 1 || normalizedApiId > SHOP_LIMIT) {
    return res.status(400).json({ error: 'Invalid Pokemon selected for purchase.' });
  }

  try {
    const ownedApiIds = await PokemonModel.findOwnedApiIdsByUserId(userId);

    if (ownedApiIds.includes(normalizedApiId)) {
      return res.status(409).json({ error: 'You already own this Pokemon.', code: 'ALREADY_OWNED' });
    }

    const selectedPokemon = await fetchPokemonByApiId(normalizedApiId);
    const result = await PokemonModel.purchaseShopItemForUser(userId, selectedPokemon);

    logger.info(
      `User ${result.user.nickname} bought ${selectedPokemon.name}. New balance: ${result.newBalance}`
    );

    return res.status(200).json({
      message: 'Purchase successful',
      newBalance: result.newBalance,
      pokemon: result.pokemon,
      shopItem: result.shopItem,
      purchase: {
        apiId: selectedPokemon.apiId,
        name: selectedPokemon.name,
        price: result.shopItem.price,
        rarity: result.shopItem.rarity,
        source: 'shop',
        purchasedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        currentCoins: error.currentCoins,
        requiredCoins: error.requiredCoins,
        nextRewardAt: error.nextRewardAt,
      });
    }

    logger.error('Error processing purchase:', error);
    return res.status(500).json({ error: 'Internal server error processing purchase' });
  }
};

export const getPurchaseHistoryHandler = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const history = await PokemonModel.findPurchaseHistoryByUserId(userId);
    return res.status(200).json({ data: history });
  } catch (error) {
    logger.error('Error fetching purchase history:', error);
    return res.status(500).json({ error: 'Internal server error fetching purchase history' });
  }
};
