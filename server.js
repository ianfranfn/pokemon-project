require('dotenv').config(); // Load the variables from .env into process.env
import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const app = express()
const port = 3000

app.use(express.json()) // Middleware to parse JSON bodies

app.get('/', (req, res) => { // When someone makes a GET request (REQ, from browser or Postman), a response (RES) is sent
  res.send('hey Postman')
})

app.get('/api/pokemon', async (req, res) => {

    console.log("Got a request to /api/pokemon")
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