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
                url: '/',
                description: 'Current Server'
            }
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
    apis: ['./routes/*.js', './controllers/*.js'],
}

const specs = swaggerJsdoc(options)
export default specs