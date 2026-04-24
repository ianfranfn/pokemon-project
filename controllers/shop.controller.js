import logger from '../utils/logger.js';
import { UserModel } from '../models/user.model.js';
import { PokemonModel } from '../models/pokemon.model.js';

export const getShopPokemonsHandler = async (req, res) => {
  try {

    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
    
    if (!response.ok) {
      throw new Error('Error fetching Pokémon from external API');
    }

    const data = await response.json();

    const shopItems = data.results.map((pkm, index) => ({
      apiId: index + 1,
      name: pkm.name,
      price: 50, 
      image: `https://img.pokemondb.net/sprites/home/normal/${pkm.name}.png`
    }));

    return res.status(200).json({ data: shopItems });
  } catch (error) {
    logger.error('Error fetching shop items:', error);
    return res.status(500).json({ error: 'Internal server error fetching shop' });
  }
};

export const buyPokemonHandler = async (req, res) => {
  const userId = req.user.id; 
  const { name, apiId, image, price } = req.body;

  if (!name || !apiId || !price) {
    return res.status(400).json({ error: 'Information about the Pokémon to be purchased is missing.' });
  }

  try {

    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.coins < price) {
      return res.status(400).json({ error: 'Insufficient coins for this purchase' });
    }

    const newBalance = user.coins - price;
    await UserModel.updateCoins(userId, newBalance);

    const newPokemon = {
      pokemon_id: apiId,
      name: name,
      type: 'Normal',
      image: image
    };

    await PokemonModel.addPokemonToUser(userId, newPokemon);
    
    logger.info(`User ${user.nickname} bought ${name}. New balance: ${newBalance}`);

    return res.status(200).json({ 
      message: 'Purchase successful', 
      newBalance: newBalance 
    });

  } catch (error) {
    logger.error('Error processing purchase:', error);
    return res.status(500).json({ error: 'Internal server error processing purchase' });
  }
};