import 'dotenv/config' // Load the variables from .env into process.env
import express from 'express'

const app = express()

app.use(express.json()) // Middleware to parse JSON bodies
app.use('/', router)


export { app } // Exporting the app for testing purposes