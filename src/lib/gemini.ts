const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY as string
const groqModel = (import.meta as any).env.VITE_GROQ_MODEL as string || 'llama-3.1-8b-instant'

if (!apiKey) {
  console.error('❌ Groq API key not found! Add VITE_GROQ_API_KEY to .env.local')
} else {
  console.log('✅ Groq API key loaded successfully')
}

interface TextResponse {
  text: () => string
}

// Helper function to generate with specific temperature
export async function generateWithTemperature(prompt: string, temperature: number = 0.9) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        top_p: 0.95,
        max_tokens: 220,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Groq API ${response.status}: ${errorBody}`)
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content?.trim() || ''
    const wrapped: TextResponse = {
      text: () => content,
    }

    return wrapped
  } catch (error) {
    console.error('Groq API Error:', error)
    throw error
  }
}