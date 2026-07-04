import express from 'express';
import {
  loginHandler,
  registerHandler,
  triggerScrapeHandler,
} from '../controllers/auth.controller.js';
import { validateRegistration } from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { strictLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /login:
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

router.post('/login', strictLimiter, loginHandler); // Route for user login
router.post('/scrape', strictLimiter, triggerScrapeHandler);

/**
 * @swagger
 * /register:
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

router.post('/register', strictLimiter, validateRegistration, registerHandler); // Route for user registration

router.get('/home', verifyToken, (req, res) => {
  res.send(`Welcome to the page, ${req.user.email}!`);
});

export default router;
