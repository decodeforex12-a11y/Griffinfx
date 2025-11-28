import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

// Initialize Gemini
// Note: In a real production app, ensure process.env.API_KEY is defined in your build environment.
const apiKey = process.env.API_KEY || ''; 
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const analyzeTrade = async (trade: Partial<Trade>): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Unable to perform AI analysis.";
  }

  try {
    const prompt = `
      You are a professional trading mentor. Analyze this trade setup objectively.
      
      Pair: ${trade.pair}
      Direction: ${trade.direction}
      Timeframe: ${trade.timeframe}
      RR Ratio: ${trade.rr?.toFixed(2)}
      Confluences Present: ${trade.confluences?.join(', ')}
      Trader's Reasoning: "${trade.reason}"
      
      Provide a concise 3-sentence feedback summary. 
      1. Comment on the technical validity based on confluences.
      2. Assess if the Risk-to-Reward (RR) is healthy.
      3. Give a brief psychological check or warning if the reasoning sounds emotional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI service. Please try again later.";
  }
};
