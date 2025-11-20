
import { GoogleGenAI, Tool } from "@google/genai";
import { Source } from '../types';

// Always use the environment variable directly as per guidelines
const apiKey = process.env.API_KEY || '';

const MODEL_NAME = 'gemini-2.5-flash';

export const generateSwarmResponse = async (
  prompt: string,
  systemInstruction: string,
  useSearch: boolean = false
): Promise<{ text: string; sources: Source[] }> => {
  if (!apiKey) {
    console.error("API Key is missing. Please check your environment variables.");
    // We don't throw here to prevent the UI from crashing entirely if key is missing during dev, 
    // but in production this should be handled.
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Configure tools: Google Search for Scanner/Verifier, None for others
  const tools: Tool[] = useSearch ? [{ googleSearch: {} }] : [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        tools,
        temperature: 0.4, // Balanced for creativity + factuality
      },
    });

    const text = response.text || "No data retrieved.";
    
    // Extract grounding sources from Google Search Grounding
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Verified Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini Agent Error:", error);
    throw error; // Re-throw to be caught by the swarm orchestrator
  }
};
