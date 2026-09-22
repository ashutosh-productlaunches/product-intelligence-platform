import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({});
const AnswerSchema = z.object({
  answer: z.string(),
});

async function askGemini(instruction?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: instruction ?? "Explain what an LLM is in one simple sentence.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          answer: {
            type: "string",
          },
        },
        required: ["answer"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned no text");
  }

  return AnswerSchema.parse(JSON.parse(response.text));
}

export async function GET() {
  try {
    const parsed = await askGemini();

    return Response.json(parsed);
  } catch {
    const parsed = await askGemini(
      "Explain what an LLM is in one simple sentence. Return a valid JSON response with an answer field containing a string."
    );

    return Response.json(parsed);
  }
}