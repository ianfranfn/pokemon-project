import 'dotenv/config' // Load the variables from .env into process.env
import { getJwtSecret } from './config/config.helper'
import { loginHandler } from './controllers/auth.controller'
import { config } from './config/index'
import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const app = express()

app.use(express.json()) // Middleware to parse JSON bodies

app.post('/login', loginHandler) // Route for user login

const verifyToken = (req, res, next) => { // Middleware to verify JWT tokens
    console.log("verifying token...")

    const authHeader = req.headers.authorization // looking for the Authorization header

    if (!authHeader) {
        console.log('No token provided')
        return res.status(401).json({ error: 'Authorization header missing' })
    }

    const token = authHeader.split(' ')[1] 

    if (!token) { // No token provided
        console.log("No token provided")
        return res.status(401).json({ error: 'No token provided' })
    }
    
    try {
        console.log('verifying token:')
        const payload = jwt.verify(token, getJwtSecret()) // Verifying the token using the secret
        req.user = payload // Storing the payload in the request object for later use
        next() // Proceed to the next middleware or route handler
        
    } catch (error) {
        console.error("Error verifying token:", error.message)
        return res.status(403).json({ error: "Invalid or expired token" })
    }
}


app.get('/home', verifyToken, (req, res) => { // When someone makes a GET request (REQ, from browser or Postman), a response (RES) is sent
  res.send(`Welcome to the home page, ${req.user.email}!`) // Using the email from the verified token payload
})

app.get('/api/pokemon', verifyToken, async (req, res) => {

    console.log(`Got a request to /api/pokemon by user: ${req.user.email}`)
    try {
        const externalUrl = 'https://pokeapi.co/api/v2/pokemon/ditto' // External API URL
        const externalApiAns = await axios.get(externalUrl) // an external API is called using Axios, Async/Await is used to confirm the response
        const pokemonData = externalApiAns.data; // The data from the API is extracted using the Axios constant
        res.json({ // A JSON is sent to Postman with the extracted data
            name: pokemonData.name,
            id: pokemonData.id,
            type: pokemonData.types[0].type.name, // The main type of the Pokémon is extracted (first in the list)
            image: pokemonData.sprites.front_default // The front image of the Pokémon is extracted, sprites is an object with several images and front_default is the default front image.
        })

    } catch (error) { // Error handling in case something goes wrong
        console.error("Error contacting PokeAPI:", error.message)

        res.status(500).json({ // A 500 error (Internal Server Error) is sent to Postman
            error: "Cannot contact PokeAPI",
            details: error.message 
        })
    }
})

export { app } // Exporting the app for testing purposes