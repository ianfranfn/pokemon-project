import express from 'express'
import axios from 'axios'
const app = express()
const port = 3000

app.get('/', (req, res) => { // Para cuando alguien haga una peticion GET (REQ, desde navegador o Postman) se le envia una respuesta (RES)  
  res.send('Hola Postman')
})

app.get('/api/pokemon', async (req, res) => {

    console.log("Recibida petición a /api/pokemon");
    try {
        const externalUrl = 'https://pokeapi.co/api/v2/pokemon/ditto'; // URL de la API externa
        const externalApiAns = await axios.get(externalUrl); // Se llama a la API externa usando Axios, Async/Await para confirmar la respuesta
        const pokemonData = externalApiAns.data; // Se extraen los datos de la API mediante la constante del Axios
        res.json({ // Se envia un JSON a postman con los datos extraidos
            nombre: pokemonData.name,
            id: pokemonData.id,
            tipo_principal: pokemonData.types[0].type.name, // Se extrae el tipo principal del pokemon (primero en la lista) 
            imagen: pokemonData.sprites.front_default // Se extrae la imagen frontal del pokemon, sprintes es un objeto con varias imagenes y front_default es la imagen frontal por defecto.
        });

    } catch (error) { // manejo de errores en caso de que algo haya salido mal
        console.error("Error al contactar la PokeAPI:", error.message);

        res.status(500).json({ // envio un error 500 (Error Interno del Servidor) a Postman
            error: "No se pudo conectar con la API de Pokémon.",
            detalle: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
})