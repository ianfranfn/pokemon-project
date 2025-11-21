import express from 'express'
import { loginHandler, registerHandler } from '../controllers/auth.controller'
import { verifyToken } from '../app.js'
import axios from 'axios'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login
router.post('/register', registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})

router.get('/api/pokemon', verifyToken, async (req, res) => {
    console.log(`got a request to /api/pokemon by user: ${req.user.email}`)
    try {
        const externalUrl = 'https://pokeapi.co/api/v2/pokemon/ditto' // External API URL
        const externalApiAns = await axios.get(externalUrl) // an external API is called using Axios, Async/Await is used to confirm the response
        const pokemonData = externalApiAns.data; // The data from the API is extracted using the Axios constant
        res.json({
            name: pokemonData.name,
            id: pokemonData.id,
            type: pokemonData.types[0].type.name,
            image: pokemonData.sprites.front_default
        })
    } catch (error) { // If there is an error contacting the external API
        console.error('Error contacting PokeAPI:', error.message)
        res.status(500).json({
            error: 'Cannot contact PokeAPI',
            details: error.message
        })   
    }
})

export default router