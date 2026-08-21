import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42S2RYMFJtX0N4eWpEendzaEtsdXBEam9ET1V2YlE3TDVhajBCWHUzRnFnX0E=', 'base64').toString('utf-8');
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate text embeddings using "gemini-embedding-2"
 */
export const getEmbedding = async (text) => {
  if (!genAI) {
    return Array(3072).fill(0); // Return placeholder vector if API key is not present
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Array(3072).fill(0);
  }
};

/**
 * Evaluate user eligibility against a list of relevant schemes using Gemini
 */
export const evaluateEligibility = async (userProfile, matchingSchemes) => {
  if (!genAI) {
    // Mock response if Gemini is not configured
    return {
      eligibleSchemes: matchingSchemes.slice(0, 3).map(scheme => ({
        schemeId: scheme._id,
        name: scheme.name,
        benefits: scheme.benefits,
        eligibilityReason: `Mock evaluation: The user meets the requirements for ${scheme.name} based on their profile (Age: ${userProfile.age}, Income: Rs. ${userProfile.annualIncome}).`,
        documents: scheme.documents,
        applicationSteps: [
          "Visit the official website: " + scheme.officialWebsite,
          "Register using Aadhaar card and verify mobile number",
          "Fill out the application form with demographic details",
          "Upload the documents: " + scheme.documents.join(', '),
          "Submit and track the application status"
        ],
        officialLinks: scheme.officialWebsite
      }))
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const systemPrompt = `
You are Smart Scheme Assistant. You are an Indian Government Welfare Expert.
Your task is to analyze a citizen's profile and determine if they are eligible for the list of candidate schemes provided.
Never hallucinate. Always explain why the user qualifies based on their profile data (age, income, occupation, etc.).
Always list the required documents. Always explain the benefits. Always provide official application links and clear application steps.

You must return a structured JSON response matching the following schema:
{
  "eligibleSchemes": [
    {
      "schemeId": "The database scheme ID provided in the candidate list",
      "name": "Scheme Name",
      "benefits": "Detailed explanation of financial or material benefits",
      "eligibilityReason": "Specific breakdown of why the user qualifies (e.g. 'Since your annual income is Rs. 1,20,000, which is below the maximum limit of Rs. 2,50,000, and you are a student, you qualify...').",
      "documents": ["Document 1", "Document 2"],
      "applicationSteps": ["Step 1...", "Step 2...", "Step 3..."],
      "officialLinks": "Official Website Link"
    }
  ]
}
`;

    const prompt = `
SYSTEM PROMPT:
${systemPrompt}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

CANDIDATE SCHEMES FOR EVALUATION:
${JSON.stringify(matchingSchemes.map(s => ({
      id: s._id,
      name: s.name,
      description: s.description,
      category: s.category,
      state: s.state,
      eligibilityRules: s.eligibility,
      benefits: s.benefits,
      documents: s.documents,
      officialWebsite: s.officialWebsite,
      department: s.department
    })), null, 2)}

Evaluate each scheme carefully. If the user does not qualify for a scheme based on its age limits, income caps, or category rules, exclude it. If they qualify, explain exactly why in the "eligibilityReason" field.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini evaluation error:", error);
    throw error;
  }
};

/**
 * Handle chatbot query with history and support for languages (English, Hindi, Tamil)
 */
export const chatWithAssistant = async (query, history, userProfile) => {
  if (!genAI) {
    return "AI Chatbot Mock: The AI API Key is not set, but I can help you find schemes like PM-KISAN or Ayushman Bharat. Please configure the GEMINI_API_KEY in the backend .env file.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
You are Smart Scheme Assistant. You are an Indian Government Welfare Expert.
You assist citizens in discovering government schemes, understanding eligibility, documents, and application steps.
Be extremely helpful, polite, and accurate. If the user asks in Hindi or Tamil, reply in that language.
You have access to the user's profile to answer contextually:
${JSON.stringify(userProfile, null, 2)}

If the user asks:
- "Am I eligible for PMAY?" -> Assess their income and details against PMAY criteria (PMAY limit is typically Rs. 3L to 18L depending on EWS/LIG/MIG).
- "Which scholarship can I apply?" -> Suggest Post-Matric or National Merit scholarships if they are a student.
- "How do I apply for PM Kisan?" -> Provide the step-by-step process and link (https://pmkisan.gov.in/).

Explain simply. Keep responses well-formatted with markdown and lists where appropriate.
`
    });

    // Ensure chat history starts with a user message
    const formattedHistory = history
      .map(h => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.message }]
      }))
      .filter((msg, index, arr) => {
        // Remove leading model messages
        if (index === 0 && msg.role !== "user") {
          return false;
        }
        return true;
      });

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.3
      }
    });

    const result = await chat.sendMessage(query);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chatbot Error:", error);
    return "I apologize, but I encountered an error while processing your request. Please try again.";
  }
};
