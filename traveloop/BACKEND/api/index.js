// Vercel serverless entry point — exports Express app without calling listen()
require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');
const { startReminderScheduler } = require('../src/services/reminderService');

// Connect DB once (Vercel reuses warm instances)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    startReminderScheduler();
    isConnected = true;
  }
};

module.exports = async (req, res) => {
  await ensureDB();
  app(req, res);
};
