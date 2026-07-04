import 'dotenv/config'; // Load the variables from .env into process.env
import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import authRoutes from './routes/auth.routes.js';
import pokemonRoutes from './routes/pokemon.routes.js';
import shopRoutes from './routes/shop.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { healthHandler, readinessHandler } from './controllers/health.controller.js';

const app = express();

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

if (sentryEnabled) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.get('/health', healthHandler);
app.get('/ready', readinessHandler);

app.use(globalLimiter); // Apply the global rate limiter to all routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/shop', shopRoutes);

if (sentryEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}

export { app }; // Exporting the app for testing purposes
