import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export const getGeminiModel = () => {
    // Initialize on first use to ensure env vars are loaded
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

export default genAI;