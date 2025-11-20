import { GoogleGenAI, Tool } from "@google/genai";
import { Source } from '../types';

const apiKey = process.env.API_KEY || '';

// We recreate the client on every call to ensure fresh config/keys if needed
// in a real app, but here it's fine to keep it static or create per request.
// The instructions advise creating a new instance before calls in some contexts, 
// but for general usage, a singleton pattern or per-function instance is okay.
// To be safe against the "select key" requirement in Veo (though we use Flash here),
// we will instantiate inside the functions.

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash'; // Using flash for speed/grounding, could be Pro.

export const generateSwarmResponse = async (
  prompt: string,
  systemInstruction: string,
  useSearch: boolean = false
): Promise<{ text: string; sources: Source[] }> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const tools: Tool[] = useSearch ? [{ googleSearch: {} }] : [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction,
        tools,
        temperature: 0.3, // Low temperature for factual agents
      },
    });

    const text = response.text || "No response generated.";
    
    // Extract grounding sources if available
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
