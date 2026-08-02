// Vercel serverless entry point — exports Express app without calling listen()
require('dotenv').config();
const app = require('../src/app');

module.exports = app;
