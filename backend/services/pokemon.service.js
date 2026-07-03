import { PokemonModel } from '../models/pokemon.model.js';

const fetchDittoData = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
  
  if (!response.ok) {
    throw new Error('Red error fetching Ditto data from PokeAPI');
  }
  
  const data = await response.json();

  return {
    name: data.name,
    apiId: data.id,
    type: data.types[0].type.name,
    image: `https://img.pokemondb.net/sprites/home/normal/${data.name}.png`,
  };
};

export const addDittoToUser = async (userId) => {
  const dittoData = await fetchDittoData();

  return PokemonModel.create({
    userId,
    name: dittoData.name,
    apiId: dittoData.apiId,
    type: dittoData.type,
    image: dittoData.image,
  });
};