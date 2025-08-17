import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateMovieInfo = async (movieName) => {
  const prompt = `Provide in which OTT "${movieName}" is present Format it cleanly. remove * and give`;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini movie error:", err);
    throw new Error("Failed to generate movie info");
  }
};

export default genAI;
