import express from 'express'
import axios from 'axios'
const app = express()
const port = 3000

app.get('/', (req, res) => { // When someone makes a GET request (REQ, from browser or Postman), a response (RES) is sent
  res.send('hey Postman')
})

app.get('/api/pokemon', async (req, res) => {

    console.log("Got a request to /api/pokemon");
    try {
        const externalUrl = 'https://pokeapi.co/api/v2/pokemon/ditto'; // External API URL
        const externalApiAns = await axios.get(externalUrl); // an external API is called using Axios, Async/Await is used to confirm the response
        const pokemonData = externalApiAns.data; // The data from the API is extracted using the Axios constant
        res.json({ // A JSON is sent to Postman with the extracted data
            nombre: pokemonData.name,
            id: pokemonData.id,
            tipo_principal: pokemonData.types[0].type.name, // The main type of the Pokémon is extracted (first in the list)
            imagen: pokemonData.sprites.front_default // The front image of the Pokémon is extracted, sprites is an object with several images and front_default is the default front image.
        });

    } catch (error) { // Error handling in case something goes wrong
        console.error("Error contacting PokeAPI:", error.message);

        res.status(500).json({ // A 500 error (Internal Server Error) is sent to Postman
            error: "Cannot contact PokeAPI",
            detalle: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})