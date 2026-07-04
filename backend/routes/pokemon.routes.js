import express from 'express';
import {
  updatePokemonHandler,
  deletePokemonHandler,
  getPokemonHandler,
} from '../controllers/pokemon.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

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
 *       401:
 *         description: Not authorized (Token Missing)
 */
router.get('/', verifyToken, getPokemonHandler);
router.put('/:id', verifyToken, updatePokemonHandler);
router.delete('/:id', verifyToken, deletePokemonHandler);

export default router;
