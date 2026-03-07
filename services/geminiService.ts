import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePracticeAdvice = async (
  query: string,
  context: string
): Promise<string> => {
  if (!apiKey) {
    return "Please configure your API Key to use the AI Coach.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are a world-class piano professor specializing in the teaching methods of Frédéric Chopin. 
    Core Principles of your teaching:
    1. Natural Physiology: The hand's natural position is not over white keys (C Major) but over black keys (B Major, E Major).
    2. Suppleness: The wrist must be flexible, acting as a shock absorber. The elbow guides the hand.
    3. Cantabile: Every exercise, even scales, must sing. Tone quality is paramount.
    4. Rubato: Encourage rhythmic breathing, not metronomic rigidity, even in exercises.
    
    Answer the student's question concisely but with musical depth. Use bullet points for exercises.`;

    const response = await ai.models.generateContent({
      model,
      contents: `Student Context: ${context}\n\nStudent Question: ${query}`,
      config: {
        systemInstruction,
      },
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble hearing the piano right now (Connection Error).";
  }
};
