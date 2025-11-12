import { config } from 'dotenv'
import { app } from './app.js' // Importing the Express app
import 'dotenv/config' // Load environment variables from .env file

const port = config.port || 3000 // Use the port from environment variables or default to 3000

app.listen(port, () => {
    console.log(`server listening in http://localhost:${port}`)
})
