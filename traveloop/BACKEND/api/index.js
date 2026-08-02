// Vercel serverless entry point — exports Express app without calling listen()
require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect DB once (Vercel reuses warm instances)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error in Vercel function:', err.message);
    }
  }
};

module.exports = async (req, res) => {
  await ensureDB();
  app(req, res);
};
