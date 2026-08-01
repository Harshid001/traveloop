const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startReminderScheduler } = require('./src/services/reminderService');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
  startReminderScheduler();
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
