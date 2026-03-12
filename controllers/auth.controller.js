import { getJwtSecret } from "../config/config.helper.js"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import logger from '../utils/logger.js'
import * as Sentry from '@sentry/node'
import * as clients from "@restatedev/restate-sdk-clients";
import { UserModel } from "../models/user.model.js"

export const registerHandler = async (req, res) => {
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required for registration' })
    } 

    try {
        const existingUser = await UserModel.findByEmail(email)
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' })
        }
        const salt = await bcrypt.genSalt(10) // Generating a salt for hashing
        const passwordHash = await bcrypt.hash(password,salt)
        const newUser = await UserModel.create ({email, passwordHash})
        logger.info(`New user registered: ${newUser.email}`);
        
        const rs = clients.connect({ url: "http://restate:8080" });
        rs.serviceSendClient({ name: "EmailService" }).sendWelcomeEmail({ email: email })
            .catch(err => logger.error("Error enqueuing task in Restate:", err))

        return res.status(201).json ({ message: 'User registered successfully', userId: newUser.id })
    }
    catch (error) { 
        Sentry.captureException(error)
        logger.error('Registration error:', error) // Logging the error for debugging, now with logger.
        return res.status(500).json({ error: 'Internal server error' })
    }
}


export const loginHandler = async (req, res) => { // Handler for login route
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' })
    }

    try {
        const user = await UserModel.findByEmail(email)
        if (!user) {
            logger.warn('Failed login: User not found for email', { email })
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            logger.warn('Failed login: Incorrect password for email', { email })
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const payload = { email: user.email, id: user.id } // Information saved in the token if login is successful
        const accessToken = jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '1h' }
        )

        res.json({ accessToken: accessToken })

    } catch (error) {
        logger.error('Login error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export const triggerScrapeHandler = async (req, res) => {
    const { pokemonName } = req.body;

    if (!pokemonName) {
        return res.status(400).json({ error: 'pokemonName is required' });
    }

    try {
        const rs = clients.connect({ url: "http://restate:8080" });

        rs.serviceSendClient({ name: "ScrapeService" }).scrapePokemonData({ pokemonName })
            .catch(err => logger.error("Error enqueuing scrape task:", err));

        return res.status(202).json({ message: `Scraping queued for ${pokemonName}` });
    } catch (error) {
        logger.error('Scrape trigger error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
