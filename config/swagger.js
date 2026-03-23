import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pokemon API',
            version: '1.0.0',
            description: 'API for managing trainers and Pokémon. Built with Node.js, Express, and MySQL.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Server'
            },
            {
                url: 'http://3.138.156.109:3000',
                description: 'Production Server (AWS)'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
            },
        },
        security: [
            {
                bearerAuth: []
            },
        ],
    },
    apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js') 
  ],
}

const specs = swaggerJsdoc(options)
export default specs