import 'dotenv/config' // Load the variables from .env into process.env
import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const app = express()
const port = 3000

app.use(express.json()) // Middleware to parse JSON bodies

app.post('/login', (req, res) => {
    const { email, password } = req.body
    if (email !== 'user@test.com' || password !== 'password123') { // I'll have to replace this with a real user authentication system with a MySQL database later
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    const payload = { // Information saved in the token
        email: email,
        id: '123'
    }

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    )

    res.json({ accessToken })
})

function verifyToken(req, res, next) { // Middleware to verify JWT tokens
    console.log("verifying token...")

    const authHeader = req.headers['authorization'] // looking for the Authorization header
    const token = authHeader && authHeader.split(' ')[1] // Extracting the token from the "Bearer <token>" format

    if (token == null) { // No token provided
        console.log("No token provided")
        return res.status(401).json({ error: 'No token provided' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => { // Verifying the token
        if (err) {
            console.log("invalid or expired token")
            return res.status(403).json({ error: "Invalid or expired token" })   
        }

        req.user = payload // Storing the payload in the request object for later use
        console.log("token verified. User:", req.user.email)

        next() // Proceed to the next middleware or route handler
    })
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})