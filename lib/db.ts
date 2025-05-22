import mongoose from 'mongoose';

declare global {
  var mongoose: any; // This is to prevent errors in development due to hot reloading
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Reduce the timeout to 10 seconds
      socketTimeoutMS: 45000, // Give enough time to execute queries
      connectTimeoutMS: 10000, // Reduce connection timeout to 10 seconds
      // These options help with reconnection
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      retryReads: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
      return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        cached.promise = null; // Reset the promise so we can try again
        throw new Error(`MongoDB connection error: ${err.message || 'Unknown error'}`);
    });
  }

  try {
  cached.conn = await cached.promise;
  return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Return a more meaningful error that will help users understand the issue
    throw new Error('Database connection failed. Please check your internet connection or contact support.');
  }
}

// Log MongoDB connection status changes for better debugging
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Handle process termination properly
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default dbConnect; 