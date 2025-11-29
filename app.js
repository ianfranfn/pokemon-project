import 'dotenv/config' // Load the variables from .env into process.env
import router from './routes/auth.routes.js' // Importing the auth routes
import express from 'express'

const app = express()

app.use(express.json()) // Middleware to parse JSON bodies
app.use('/', router)

app.use('/', router) // Using the auth routes

export { app } // Exporting the app for testing purposes