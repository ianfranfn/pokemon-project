import express from 'express'
import { updatePokemonHandler, deletePokemonHandler, getPokemonHandler } from '../controllers/pokemon.controller.js'
import { loginHandler, registerHandler } from '../controllers/auth.controller.js'
import { validateRegistration } from '../middleware/validation.middleware.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login
router.post('/register', validateRegistration, registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})

/**
 * @swagger
 * /api/pokemon:
 *  get:
 *    summary: Get the list of all Pokemon
 *    tags: [Pokemons]
 *    security:
 *    - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of Pokemon obtained correctly
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: "Pikachu"
 *                  image:
 *                    type: string
 *                    example: "http://imagen.com/pikachu.png"
 *      401:
 *        description: Not authorized (Token Missing)
 */


router.get('/api/pokemon', verifyToken, getPokemonHandler)
router.put('/api/pokemon/:id', verifyToken, updatePokemonHandler)
router.delete('/api/pokemon/:id', verifyToken, deletePokemonHandler)

export default router