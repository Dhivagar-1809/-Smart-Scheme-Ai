import { Scheme } from '../models/schemas.js';
import { getEmbedding } from './geminiService.js';

// Simple Vector Store Helper using Cosine Similarity for fallback mode
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Perform a semantic search on schemes using embeddings and cosine similarity
 */
export const searchVectorSchemes = async (queryText, limit = 5) => {
  try {
    console.log(`Performing semantic search for: "${queryText}"`);
    const queryEmbedding = await getEmbedding(queryText);
    
    // Check if the query embedding is just zeros (mock/error state)
    const isZeroVec = queryEmbedding.every(v => v === 0);
    
    // Fetch all schemes with embeddings
    const schemes = await Scheme.find({});
    
    if (isZeroVec) {
      console.warn("Zero embedding generated, falling back to text regex search.");
      // Fallback: simple text search on name/description if embeddings are zero
      return Scheme.find({
        $or: [
          { name: { $regex: queryText, $options: 'i' } },
          { description: { $regex: queryText, $options: 'i' } },
          { category: { $regex: queryText, $options: 'i' } }
        ]
      }).limit(limit);
    }
    
    // Compute similarity for each scheme
    const schemesWithScores = schemes.map(scheme => {
      const sim = cosineSimilarity(queryEmbedding, scheme.vectorEmbeddings);
      return {
        scheme,
        similarity: sim
      };
    });
    
    // Sort by similarity descending
    schemesWithScores.sort((a, b) => b.similarity - a.similarity);
    
    // Log the similarity scores for debugging/demo
    console.log(`Top matches for "${queryText}":`);
    schemesWithScores.slice(0, 3).forEach(match => {
      console.log(`- ${match.scheme.name} (Score: ${match.similarity.toFixed(4)})`);
    });
    
    return schemesWithScores.slice(0, limit).map(match => match.scheme);
  } catch (error) {
    console.error("Vector search error:", error);
    // Ultimate fallback: return basic text search results
    return Scheme.find({
      $or: [
        { name: { $regex: queryText, $options: 'i' } },
        { description: { $regex: queryText, $options: 'i' } }
      ]
    }).limit(limit);
  }
};

/**
 * Re-index all schemes in the database with fresh embeddings
 */
export const reindexSchemes = async () => {
  try {
    const schemes = await Scheme.find({});
    console.log(`Re-indexing ${schemes.length} schemes...`);
    
    for (const scheme of schemes) {
      const textToEmbed = `${scheme.name}. ${scheme.description} Category: ${scheme.category}. State: ${scheme.state}. Benefits: ${scheme.benefits}`;
      const embedding = await getEmbedding(textToEmbed);
      scheme.vectorEmbeddings = embedding;
      await scheme.save();
      console.log(`Re-indexed: ${scheme.name}`);
    }
    console.log("Re-indexing complete!");
    return true;
  } catch (error) {
    console.error("Re-indexing schemes failed:", error);
    return false;
  }
};
