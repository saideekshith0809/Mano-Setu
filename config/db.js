/**
 * ManoSetu - MongoDB MongoDB Store (Mongoose)
 */

const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manosetu';

async function initDB() {
  const timeout = new Promise((resolve) => setTimeout(() => {
    console.log('\n\x1b[33m⚠️ DB TIMEOUT: Entering Demo Mode.\x1b[0m');
    resolve(false);
  }, 1000));

  const connectDB = (async () => {
    try {
      mongoose.set('strictQuery', false);
      if (process.env.MOCK_DB === 'true') return true;
      
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 800 });
      console.log(`\x1b[32m✅ MongoDB Connected: ${mongoose.connection.host}\x1b[0m`);

      // Seed Therapists if empty
      const count = await Therapist.countDocuments();
      if (count === 0) {
        await Therapist.insertMany([
          { name: 'Dr. Priya Sharma', specialization: 'Child & Adolescent Psychology', tags: ['Teens', 'Anxiety', 'CBT'], rating: 4.9, reviews: 127, avatar: '👩‍⚕️' },
          { name: 'Dr. Arjun Mehta', specialization: 'Cognitive Behavioral Therapy', tags: ['Depression', 'Stress', 'DBT'], rating: 4.8, reviews: 94, avatar: '👨‍⚕️' },
          { name: 'Dr. Meera Nair', specialization: 'Trauma & Family Therapy', tags: ['Trauma', 'Family', 'Hindi'], rating: 4.9, reviews: 203, avatar: '👩‍⚕️' }
        ]);
        console.log('✅ Seeded initial Therapists.');
      }
      return true;
    } catch (error) {
      console.error(`\x1b[31m❌ MongoDB Connection Error:\x1b[0m`, error.message);
      return false;
    }
  })();

  try {
    const result = await Promise.race([connectDB, timeout]);
    if (result === false) {
      process.env.MOCK_DB = 'true';
      console.log('\x1b[35m🚀 ManoSetu now running in High-Performance Demo Mode.\x1b[0m');
    }
  } catch (err) {
    process.env.MOCK_DB = 'true';
    console.log('⚠️ Forced Mock Mode due to DB timeout.');
  }
}

module.exports = { initDB };
