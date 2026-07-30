const mongoose = require('mongoose');
const { env } = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (env.NODE_ENV !== 'test') {
      await mongoose.connection.syncIndexes();
      console.log('MongoDB indexes synchronized');
    }

    return conn;
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES} failed: ${error.message}`);
    if (retryCount < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    console.error('MongoDB connection failed after all retries. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;