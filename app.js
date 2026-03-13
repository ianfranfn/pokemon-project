import 'dotenv/config' // Load the variables from .env into process.env
import express from 'express'
import cors from 'cors'
import * as Sentry from '@sentry/node'
import router from './routes/auth.routes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'
import { globalLimiter } from './middleware/rateLimit.middleware.js'

const app = express()

Sentry.init({ // Sentry initialization for error tracking, performance monitoring, etc.
    dsn: "https://1a5508b0643b1c2d872802ef266fd6a4@o4510542021853184.ingest.us.sentry.io/4510542024540160", // Data Source Name for Sentry project
    tracesSampleRate: 1.0,
})


app.use(Sentry.Handlers.requestHandler()) // Sentry request handler middleware
app.use(Sentry.Handlers.tracingHandler()) // Sentry tracing handler middleware
app.use(cors())
app.use(express.json()) // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }))

app.use(globalLimiter) // Apply the global rate limiter to all routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

app.use('/', router) // Using the auth routes   

app.use(Sentry.Handlers.errorHandler()) // Sentry error handler middleware

export { app } // Exporting the app for testing purposes 