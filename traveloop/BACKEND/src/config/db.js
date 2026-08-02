const mongoose = require('mongoose');
const { env } = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (env.NODE_ENV !== 'test') {
      await mongoose.connection.syncIndexes().catch(err => console.warn('Index sync warning:', err.message));
      console.log('MongoDB indexes synchronized');
    }

    return conn;
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES} failed: ${error.message}`);
    if (process.env.VERCEL || process.env.NODE_ENV === 'test') {
      throw error;
    }
    if (retryCount < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    console.error('MongoDB connection failed after all retries.');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;