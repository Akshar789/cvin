import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || '';
const isOpenRouterKey = apiKey.startsWith('sk-or-');

const openai = new OpenAI({
  apiKey,
  ...(isOpenRouterKey && { baseURL: 'https://openrouter.ai/api/v1' }),
});

export default openai;
