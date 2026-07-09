import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function testEmbedding(modelName) {
  try {
    console.log(`Testing embedding model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent("Hello world");
    console.log(`Success! Embedding length for ${modelName}:`, result.embedding.values.length);
    return true;
  } catch (err) {
    console.error(`Failed embedding for ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  await testEmbedding("text-embedding-004");
  await testEmbedding("gemini-embedding-2");
  await testEmbedding("gemini-embedding-001");
}
run();
