import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';
import { PokemonModel } from '../models/pokemon.model.js';
import { addDittoToUser } from '../services/pokemon.service.js';
import { parse } from 'dotenv';

export const updatePokemonHandler = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name field is required' });
  }

  try {
    const success = await PokemonModel.update(id, { name });

    if (!success) {
      return res.status(404).json({ error: 'Pokemon not found or no changes made' });
    }

    return res.status(200).json({ message: 'Pokemon updated successfully' });
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Update error:', error);
    return res.status(500).json({ error: 'Internal server error during update' });
  }
};

export const deletePokemonHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await PokemonModel.delete(id);

    if (!success) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    return res.status(204).send();
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Deletion error:', error);
    return res.status(500).json({ error: 'Internal server error during deletion' });
  }
};

export const getPokemonHandler = async (req, res) => {
  logger.info(`got a request to /api/pokemon by user: ${req.user.email}`);
  try {
    // Try to get the user's Pokemons

    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, totalItems } = await PokemonModel.findAllByUserId(userId, limit, offset);

    if (totalItems === 0 && page === 1) {
      try {
        const newPokemon = await addDittoToUser(userId);
        return res.status(201).json({
          data: [newPokemon],
          pagination: {
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: limit,
          },
        });
      } catch (creationError) {
        // Captures the specific error of creation (external API or DB)
        Sentry.captureException(creationError);
        logger.warn('Error adding new Pokemon:', creationError.message);
        return res.status(503).json({
          error: 'External service unavailable',
          details: creationError.message,
        });
      }
    }

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      data: rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    // If there is an error contacting the external API
    Sentry.captureException(error);
    logger.error('Error fetching Pokemons:', error.message);
    return res.status(500).json({
      error: 'Internal database error during read',
      details: error.message,
    });
  }
};
