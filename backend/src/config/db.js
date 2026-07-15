/**
 * config/db.js
 * -----------------------------------------------------------------------
 * Establishes and manages the MongoDB connection using Mongoose.
 * Exits the process on a fatal connection error so that process managers
 * (PM2, Render, Docker) can restart the service cleanly.
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      // Modern mongoose (6+) no longer needs useNewUrlParser/useUnifiedTopology,
      // they are kept here as comments for documentation purposes only.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting to reconnect is handled by the driver.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Fatal connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
