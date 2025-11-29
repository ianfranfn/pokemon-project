import 'dotenv/config' // Load the variables from .env into process.env
import { getJwtSecret } from './config/config.helper'
import express from 'express'
import jwt from 'jsonwebtoken'
import router from './routes/auth.routes'

const app = express()

app.use(express.json()) // Middleware to parse JSON bodies
app.use('/', router)

app.use('/', router) // Using the auth routes

export { app } // Exporting the app for testing purposes