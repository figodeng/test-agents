import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

export const model = new ChatOpenAI({
  // deepseek-v4-flash, deepseek-v4-pro
  model: "deepseek-v4-flash", 
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
  modelKwargs: {
    thinking: { type: "disabled" },
  },
});
