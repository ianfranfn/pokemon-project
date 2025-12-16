import axios from 'axios'
import { PokemonModel } from '../models/pokemon.model.js'

export const fetchDittoData = async () => {
    try {
        const externalUrl = 'https://pokeapi.co/api/v2/pokemon/ditto' // External API URL
        const externalApiAns = await axios.get(externalUrl) // an external API is called using Axios, Async/Await is used to confirm the response
        const pokemonData = externalApiAns.data; // The data from the API is extracted using the Axios constant
        return {
            name: pokemonData.name,
            apiId: pokemonData.id,
            type: pokemonData.types[0].type.name,
            image: pokemonData.sprites.front_default
        }
    } catch (error) {
        logger.error('Error contacting PokeAPI:', error.message);
        throw new Error('Cannot contact PokeAPI');
    }
}

export const getUserPokemons = async (userId) => {
    return PokemonModel.findAllByUserId(userId) // vinculated the logic with the model method
}

export const addDittoToUser = async (userId) => {
    const dittoData = await fetchDittoData()

    return PokemonModel.create({
        userId,
        name: dittoData.name,
        apiId: dittoData.apiId,
        type: dittoData.type,
        image: dittoData.image
    })
}