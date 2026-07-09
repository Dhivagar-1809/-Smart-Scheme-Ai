import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey);

async function testFetch() {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    if (listData.models) {
      console.log("Available models:");
      listData.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("No models returned:", listData);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFetch();
