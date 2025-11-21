import { PokemonModel } from "../models/pokemon.model"

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