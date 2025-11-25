import express from 'express'
import { getUserPokemons, addDittoToUser } from '../services/pokemon.service.js'
import { updatePokemonHandler, deletePokemonHandler } from '../controllers/pokemon.controller.js'
import { loginHandler, registerHandler } from '../controllers/auth.controller'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login
router.post('/register', registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})

router.get('/api/pokemon', verifyToken, async (req, res) => {
    console.log(`got a request to /api/pokemon by user: ${req.user.email}`)
    try { // Try to get the user's Pokemons
        const pokemons = await getUserPokemons(req.user.id) // Get Pokemons from the service

        if (pokemons.length === 0) {
            const newPokemon = await addDittoToUser(req.user.id)
            return res.json([newPokemon])
        }

        return res.json(pokemons)

    } catch (error) { // If there is an error contacting the external API
        console.error('Error contacting PokeAPI:', error.message)
        res.status(500).json({
            error: 'Cannot contact PokeAPI',
            details: error.message
        })   
    }
})

router.put('/api/pokemon/:id', verifyToken, updatePokemonHandler)

router.delete('/api/pokemon/:id', verifyToken, deletePokemonHandler)

export default router