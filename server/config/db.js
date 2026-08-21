import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('Failed to set custom DNS servers:', err.message);
  }
}

dotenv.config();

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb+srv://dhiva5286_db_user:Dhivagar45@cluster0.cybvti4.mongodb.net/?retryWrites=true&w=majority';
    const conn = await mongoose.connect(dbUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;