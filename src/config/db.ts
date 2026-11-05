import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Event from '../models/Event';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { sampleEvents } from '../data/seedData';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Atlas/URI successfully.');
    } else {
      console.log('No MONGODB_URI provided. Initializing in-memory MongoDB instance for local/test use...');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log('✅ Connected to MongoMemoryServer at:', inMemoryUri);
    }

    await seedInitialData();
  } catch (error: any) {
    console.warn('⚠️ Connection to primary MongoDB failed:', error?.message);
    if (!mongod) {
      console.log('Falling back to MongoMemoryServer...');
      try {
        mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        await mongoose.connect(inMemoryUri);
        console.log('✅ Connected to fallback MongoMemoryServer at:', inMemoryUri);
        await seedInitialData();
      } catch (fallbackErr) {
        console.error('❌ Failed to connect to MongoDB and fallback failed:', fallbackErr);
        process.exit(1);
      }
    }
  }
};

const seedInitialData = async () => {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('Seeding initial community events...');
      await Event.insertMany(sampleEvents);
      console.log(`✅ Seeded ${sampleEvents.length} initial events successfully.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('CivicPulse@2026', 10);
      await User.create([
        {
          name: 'Tahmina Rahman',
          email: 'organizer@civicpulse.org',
          password: hashedPassword,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Passionate community advocate and grassroots volunteer coordinator in Dhaka.',
          location: 'Mirpur, Dhaka',
          phone: '+880 1712-345678',
        },
        {
          name: 'Demo Volunteer',
          email: 'volunteer@civicpulse.org',
          password: hashedPassword,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          bio: 'Ready to lend a helping hand for any local cause.',
          location: 'Mohammadpur, Dhaka',
          phone: '+880 1819-987654',
        }
      ]);
      console.log('✅ Seeded demo organizer and volunteer accounts.');
    }
  } catch (err) {
    console.error('Error during data seeding:', err);
  }
};
