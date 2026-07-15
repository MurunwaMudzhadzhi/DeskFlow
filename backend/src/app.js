/**
 * app.js
 * -----------------------------------------------------------------------
 * Pure Express application configuration: security middleware, body
 * parsing, request logging, Swagger docs, API routes, and centralized
 * error handling.
 *
 * Deliberately does NOT connect to MongoDB or call app.listen() — that
 * happens in server.js. Keeping app configuration separate from process
 * bootstrapping means the app can be imported directly into tests
 * (via supertest) without needing a live database connection or an
 * open network port.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------
// Security & core middleware
// ---------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---------------------------------------------------------------------
// Health check (useful for Render health checks / uptime monitors)
// ---------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DeskFlow API is healthy', uptime: process.uptime() });
});

// ---------------------------------------------------------------------
// API Documentation
// ---------------------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'DeskFlow API Docs' }));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ---------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// ---------------------------------------------------------------------
// 404 + centralized error handler
// ---------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
