import { GoogleGenAI } from '@google/genai';

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,

});

export class AgentError extends Error {
  constructor(
    public agent: 'moderator' | 'planner' | 'insight' | 'execution' | 'editor',
    message: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}
