import 'dotenv/config' // Load environment variables from .env file
import { config } from 'dotenv'
import { app } from './app.js' // Importing the Express app
import logger from './utils/logger.js'

const port = config.port || 3000 // Use the port from environment variables or default to 3000

app.listen(port, () => {
    logger.info(`server listening in http://localhost:${port}`)
})
