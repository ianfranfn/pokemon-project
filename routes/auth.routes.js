import express from 'express'
import { updatePokemonHandler, deletePokemonHandler, getPokemonHandler } from '../controllers/pokemon.controller.js'
import { loginHandler, registerHandler, triggerScrapeHandler } from '../controllers/auth.controller.js'
import { validateRegistration } from '../middleware/validation.middleware.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { strictLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router()

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in to an existing user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */

router.post('/login', strictLimiter, loginHandler) // Route for user login
router.post('/scrape', strictLimiter, triggerScrapeHandler);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 */

router.post('/register', strictLimiter, validateRegistration, registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})

/**
 * @swagger
 * /api/pokemon:
 * __get:
 *     summary: Get the list of all Pokemon
 *     tags: [Pokemons]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *       description: The page number
 *     - in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 *       description: The number of items per page
 *     responses:
 *       200:
 *         description: List of Pokemon obtained correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *               example:
 *                 data:
 *                   - id: 1
 *                     name: "Pikachu"
 *                     image: "http://imagen.com/pikachu.png"
 *                 pagination:
 *                   totalItems: 1
 *                   totalPages: 1
 *                   currentPage: 1
 *                   itemsPerPage: 10
 *       401:
 *         description: Not authorized (Token Missing)
 */


router.get('/api/pokemon', verifyToken, getPokemonHandler)
router.put('/api/pokemon/:id', verifyToken, updatePokemonHandler)
router.delete('/api/pokemon/:id', verifyToken, deletePokemonHandler)

export default router