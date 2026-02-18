import mongoose from 'mongoose';

export async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI / MONGO_URI environment variable');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  return mongoose.connect(uri, {
    // useNewUrlParser / useUnifiedTopology are defaults in newer mongoose
  });
}