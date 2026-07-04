import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getShopPokemonsHandler,
  buyPokemonHandler,
  getPurchaseHistoryHandler,
} from '../controllers/shop.controller.js';

const router = express.Router();

router.get('/', verifyToken, getShopPokemonsHandler);
router.post('/buy', verifyToken, buyPokemonHandler);
router.get('/history', verifyToken, getPurchaseHistoryHandler);

export default router;
