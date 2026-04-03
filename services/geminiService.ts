import { GoogleGenAI } from "@google/genai";
import { Mode } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const getSamplingAdvice = async (
  mode: Mode,
  fieldsNeeded: number,
  goalArea: string,
  fovArea: string
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      I am planning a scientific observation task using a ${mode === Mode.MICROSCOPE ? 'microscope' : 'computer screen'} setup.
      
      Here is the data:
      - Goal Area to Cover: ${goalArea}
      - Single Field of View Area: ${fovArea}
      - Calculated Total Fields Required: ${fieldsNeeded.toFixed(2)}
      
      Please provide a brief, professional recommendation (max 150 words) on:
      1. Whether this number of fields is statistically sound for general population sampling (e.g., is it too few for reliability, or excessively high for manual counting?).
      2. A recommended sampling strategy (e.g., systematic grid, random stratified, or stereological approach).
      
      Keep the tone helpful for a scientist or researcher.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to retrieve AI advice at this moment. Please check your API key configuration.";
  }
};
