/**
 * server.js
 * -----------------------------------------------------------------------
 * Process entry point. Loads environment variables, connects to
 * MongoDB, then starts the HTTP server using the app defined in app.js.
 * Kept deliberately thin so app.js can be imported into tests without
 * triggering a real database connection or opening a port.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[DeskFlow API] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[DeskFlow API] Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

start();

module.exports = app;
