import { GoogleGenAI, Type } from "@google/genai";
import { AppTheme, DailyInsight } from "../types";

// NOTE: API Key must be in process.env.API_KEY
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTheme = async (prompt: string): Promise<AppTheme | null> => {
  if (!ai) {
    console.error("Gemini API Key not found.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a color theme for a calendar app based on this description: "${prompt}". 
      Return valid 6-digit hex codes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Main brand color, distinct and strong" },
                secondary: { type: Type.STRING, description: "Light background tint compatible with primary" },
                accent: { type: Type.STRING, description: "Highlight color for special events" },
                surface: { type: Type.STRING, description: "Card/Container background (usually white or very light)" },
                text: { type: Type.STRING, description: "Main text color (usually dark)" },
                background: { type: Type.STRING, description: "Global body background color" },
              },
              required: ["primary", "secondary", "accent", "surface", "text", "background"]
            }
          },
          required: ["name", "colors"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AppTheme;
    }
    return null;
  } catch (error) {
    console.error("Theme generation failed:", error);
    return null;
  }
};

export const getDailyInsight = async (dateStr: string, lunarDateStr: string): Promise<DailyInsight | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, cultural daily insight for the date: ${dateStr} (Lunar: ${lunarDateStr}). 
      Output language must be **Chinese (Simplified)**.
      Include a short fortune (运势), a "on this day" historical fact (focus on Chinese or World history), a lucky color, and number.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            fortune: { type: Type.STRING, description: "A poetic, short fortune or advice in Chinese (max 30 chars)" },
            history: { type: Type.STRING, description: "One interesting historical event on this day in Chinese (max 50 chars)" },
            luckyColor: { type: Type.STRING, description: "Lucky color name in Chinese" },
            luckyNumber: { type: Type.STRING }
          },
          required: ["fortune", "history", "luckyColor", "luckyNumber"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DailyInsight;
    }
    return null;

  } catch (error) {
    console.error("Insight generation failed", error);
    return null;
  }
};

export const getHoroscope = async (signName: string, dateStr: string): Promise<string | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `为${signName}提供${dateStr}的一句简短运势建议。
      Output language: Chinese (Simplified).
      Length: Max 20 chars.
      Tone: Mystical but encouraging.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             tip: { type: Type.STRING }
          },
          required: ["tip"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.tip;
    }
    return null;
  } catch (error) {
    console.error("Horoscope generation failed", error);
    return null;
  }
};