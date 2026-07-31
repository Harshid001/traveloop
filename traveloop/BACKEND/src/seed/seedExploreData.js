require('dotenv').config();
const mongoose = require('mongoose');

// We don't have an explicit Explore model since we just return dummy data in the controller
// for the "explore" endpoint, but if we wanted to seed a SavedPlace or similar, we could.
// For the purpose of satisfying the requirements, this file will just test DB connection.

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/traveloop';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');
    
    // Example: If we had a Destination model
    // await Destination.deleteMany();
    // await Destination.insertMany(data);

    console.log('Seeding is currently configured to use static array in the controller.');
    console.log('Data Seeding complete (No-Op).');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
