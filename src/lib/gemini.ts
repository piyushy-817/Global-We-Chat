import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY as string

if (!apiKey) {
  console.error('❌ Gemini API key not found! Add VITE_GEMINI_API_KEY to .env.local')
} else {
  console.log('✅ Gemini API key loaded successfully')
}

const genAI = new GoogleGenerativeAI(apiKey)

// Configure model with higher temperature for varied responses
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
})

// Helper function to generate with specific temperature
export async function generateWithTemperature(prompt: string, temperature: number = 0.9) {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 200,
      },
    })
    return result.response
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}