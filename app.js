import 'dotenv/config' // Load the variables from .env into process.env
import express from 'express'
import router from './routes/auth.routes.js'

const app = express()

app.use(express.json()) // Middleware to parse JSON bodies
app.use('/', router) // Using the auth routes

export { app } // Exporting the app for testing purposes