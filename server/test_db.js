import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Scheme } from './models/schemas.js';
import connectDB from './config/db.js';
import dns from 'dns';

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('Failed to set custom DNS servers:', err.message);
  }
}

dotenv.config();

async function run() {
  try {
    await connectDB();
    const scheme = await Scheme.findOne({});
    if (scheme) {
      console.log(`Scheme: ${scheme.name}`);
      console.log(`Embeddings type: ${typeof scheme.vectorEmbeddings}`);
      console.log(`Embeddings isArray: ${Array.isArray(scheme.vectorEmbeddings)}`);
      if (scheme.vectorEmbeddings) {
        console.log(`Embeddings length: ${scheme.vectorEmbeddings.length}`);
        const firstFew = scheme.vectorEmbeddings.slice(0, 5);
        console.log(`First few values:`, firstFew);
      }
    } else {
      console.log("No schemes found in the database.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Database test error:", err);
    process.exit(1);
  }
}

run();
