import { getJwtSecret } from '../config/config.helper.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import * as Sentry from '@sentry/node';
import * as clients from '@restatedev/restate-sdk-clients';
import { UserModel } from '../models/user.model.js';
import { EmailLogModel } from '../models/emailLog.model.js';
import { PokemonModel } from '../models/pokemon.model.js';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const registerHandler = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res
      .status(400)
      .json({ error: 'Email, password, and nickname are required for registration' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (nickname.length < 3 || nickname.length > 20) {
    return res.status(400).json({ error: 'Nickname must be between 3 and 20 characters long' });
  }

  try {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const existingNickname = await UserModel.findByNickname(nickname);
    if (existingNickname) {
      return res
        .status(409)
        .json({ error: 'Nickname is already taken. Please choose another one.' });
    }

    const salt = await bcrypt.genSalt(10); // Generating a salt for hashing
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await UserModel.create({ email, passwordHash, nickname });
    logger.info(`New user registered: ${newUser.email} with nickname: ${newUser.nickname}`);

    const starterPokemons = [
      {
        pokemon_id: 1,
        name: 'Bulbasaur',
        type: 'Grass/Poison',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      },
      {
        pokemon_id: 4,
        name: 'Charmander',
        type: 'Fire',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      },
    ];

    try {
      for (const pkm of starterPokemons) {
        await PokemonModel.addPokemonToUser(newUser.id, pkm);
      }
      logger.info(`Starter Pokemons assigned successfully to user ID: ${newUser.id}`);
    } catch (pkmError) {
      logger.error('Error assigning starter Pokemons:', pkmError);
      Sentry.captureException(pkmError);
    }

    const logId = await EmailLogModel.create(email);

    const rs = clients.connect({ url: process.env.RESTATE_URL || 'http://127.0.0.1:8080' });
    
    rs.serviceSendClient({ name: 'EmailService' })
      .sendWelcomeEmail({ email: email, logId: logId })
      .catch((err) => {
        logger.error('Error enqueuing task in Restate:', err);
        console.error(err.cause ? err.cause : err);
      });

    return res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Registration error:', error); // Logging the error for debugging, now with logger.
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginHandler = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  try {
    const user = await UserModel.findByIdentifier(identifier);
    if (!user) {
      logger.warn('Failed login: User not found for identifier', { identifier });
      return res.status(401).json({ error: 'Invalid identifier or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      logger.warn('Failed login: Incorrect password for identifier', { identifier });
      return res.status(401).json({ error: 'Invalid identifier or password' });
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let currentCoins = user.coins || 100; 
    let rewardGiven = false;
    const rewardAmount = 50;

    let lastLoginString = null;
    if (user.last_login_date) {
      const d = new Date(user.last_login_date);
      lastLoginString = d.toISOString().split('T')[0];
    }

    if (lastLoginString !== todayString) {
      currentCoins += rewardAmount;
      await UserModel.updateDailyReward(user.id, currentCoins, todayString);
      rewardGiven = true;
      logger.info(`User ${user.nickname} received daily reward. New balance: ${currentCoins}`);
    }
    const payload = { 
      email: user.email, 
      id: user.id, 
      nickname: user.nickname,
      coins: currentCoins 
    }; 
    const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });

    res.json({ 
      accessToken: accessToken,
      coins: currentCoins,
      rewardGiven: rewardGiven,
      rewardAmount: rewardAmount
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const triggerScrapeHandler = async (req, res) => {
  const { pokemonName } = req.body;

  if (!pokemonName) {
    return res.status(400).json({ error: 'pokemonName is required' });
  }

  try {
    const rs = clients.connect({ url: process.env.RESTATE_URL || 'http://localhost:8080' });

    rs.serviceSendClient({ name: 'ScrapeService' })
      .scrapePokemonData({ pokemonName })
      .catch((err) => logger.error('Error enqueuing scrape task:', err));

    return res.status(202).json({ message: `Scraping queued for ${pokemonName}` });
  } catch (error) {
    logger.error('Scrape trigger error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
