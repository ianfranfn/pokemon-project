import logger from '../utils/logger.js';
import { PokemonModel } from '../models/pokemon.model.js';

const SHOP_LIMIT = 20;
const POKEMON_PRICE = 50;

const buildPokemonImageUrl = (name) => `https://img.pokemondb.net/sprites/home/normal/${name}.png`;

const normalizeShopPokemon = (pokemon) => ({
  apiId: pokemon.id,
  name: pokemon.name,
  price: POKEMON_PRICE,
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

    const shopItems = data.results.map((pkm, index) => ({
      apiId: index + 1,
      name: pkm.name,
      price: POKEMON_PRICE,
      image: buildPokemonImageUrl(pkm.name),
      owned: ownedApiIds.has(index + 1),
    }));

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
    const result = await PokemonModel.purchaseForUser(userId, selectedPokemon, POKEMON_PRICE);

    logger.info(
      `User ${result.user.nickname} bought ${selectedPokemon.name}. New balance: ${result.newBalance}`
    );

    return res.status(200).json({
      message: 'Purchase successful',
      newBalance: result.newBalance,
      pokemon: result.pokemon,
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
