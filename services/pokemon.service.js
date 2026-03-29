import { PokemonModel } from '../models/pokemon.model.js';

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
