import express from 'express'
import { updatePokemonHandler, deletePokemonHandler, getPokemonHandler } from '../controllers/pokemon.controller.js'
import { loginHandler, registerHandler } from '../controllers/auth.controller'
import { validateRegistration } from '../middleware/validation.middleware.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login
router.post('/register', validateRegistration, registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})

router.get('/api/pokemon', verifyToken, getPokemonHandler)
router.put('/api/pokemon/:id', verifyToken, updatePokemonHandler)
router.delete('/api/pokemon/:id', verifyToken, deletePokemonHandler)

export default router