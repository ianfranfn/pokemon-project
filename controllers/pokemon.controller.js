import { PokemonModel } from "../models/pokemon.model"
import { addDittoToUser, getUserPokemons } from "../services/pokemon.service"

export const updatePokemonHandler = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const userId = req.user.id

    if (!name) {
        return res.status(400).json({ error: 'Name field is required' })
    }

    try {
        const success = await PokemonModel.update(id, { name })

        if (!success) {
            return res.status(404).json({ error: 'Pokemon not found or no changes made' })
        }

        return res.status(200).json({ message: 'Pokemon updated successfully' })
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: 'Internal server error during update' })
    }
}

export const deletePokemonHandler = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
        const success = await PokemonModel.delete(id)

        if (!success) {
            return res.status(404).json({ error: 'Pokemon not found' })
        }

        return res.status(204).send()
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Internal server error during deletion' })
        
    }
}

export const getPokemonHandler = async (req, res) => {
    console.log(`got a request to /api/pokemon by user: ${req.user.email}`)
    try { // Try to get the user's Pokemons
        const userId = req.user.id
        const pokemons = await getUserPokemons(userId) // Get Pokemons from the service

        if (pokemons.length === 0) {
            try {
                const newPokemon = await addDittoToUser(userId)
                return res.status(201).json([newPokemon]) 
            } catch (creationError) { // Captures the specific error of creation (external API or DB)
                console.error('Error adding new Pokemon:', creationError.message);
                return res.status(503).json({
                    error: 'External service unavailable',
                    details: creationError.message
                })
            }
        }

        return res.status(200).json(pokemons)

    } catch (error) { // If there is an error contacting the external API
        console.error('Error fetching Pokemons:', error.message)
        return res.status(500).json({
            error: 'Internal database error during read',
            details: error.message
        })   
    }
}