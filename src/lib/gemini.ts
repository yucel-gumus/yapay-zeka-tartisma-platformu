import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const getModel = (modelName: string = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const availableModels = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite', 
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];

export const judgeModel = 'gemini-2.5-pro';
