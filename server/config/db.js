import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Configure custom DNS servers to bypass querySrv ECONNREFUSED in certain networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server fallback could not be applied:', e.message);
}

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-scheme-assistant';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
