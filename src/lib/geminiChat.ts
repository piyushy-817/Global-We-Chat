import { generateWithTemperature } from './gemini'
import { getPersona } from '../config/personas'
import { Message } from '../types'

function buildConversationContext(messages: Message[]): string {
  const recent = messages.slice(-6)
  return recent
    .map(m => `${m.isOutgoing ? 'You' : 'They'}: ${m.content}`)
    .join('\n')
}



export async function getAIReply(
  contactName: string,
  messages: Message[],
  lastUserMessage: string
): Promise<string> {
  const persona = getPersona(contactName)
  const context = buildConversationContext(messages)

  const prompt = `${persona.systemPrompt}

Current conversation:
${context}

They just said: "${lastUserMessage}"

IMPORTANT: Generate a DIFFERENT and NATURAL response. Make it feel spontaneous, not like a template. Be conversational and genuine. Vary your style each time.

Reply as ${contactName}:`

  try {
    console.log(`🤖 Generating reply for ${contactName}...`)
    const result = await generateWithTemperature(prompt, 0.95)
    const text = result.text().trim()
    
    if (text && text.length > 0 && text.length < 500) {
      console.log(`✅ AI Response: "${text.substring(0, 60)}..."`)
      return text
    }
  } catch (err) {
    console.error(`❌ API Error for ${contactName}:`, err)
  }
  
  // Varied fallback responses
  const randomResponses = [
    'Haha yeah 😄',
    'Oh nice!',
    'Totally!',
    'No way 😅',
    'That\'s funny 😂',
    'For sure',
    'Interesting point',
    'Couldn\'t agree more',
    'Damn 😅',
    'Haan bilkul!',
    'Sach! 💯',
    'Bilkul bhai!',
    'True that',
    'Exactly!',
    'Absolutely!',
    'Makes sense',
    'Lol okay',
    'Really?',
    'Oh cool',
    'You there?',
  ]
  
  return randomResponses[Math.floor(Math.random() * randomResponses.length)]
}

export async function getSmartReplies(
  contactName: string,
  lastIncomingMessage: string,
  recentMessages: Message[]
): Promise<string[]> {
  const persona = getPersona(contactName)
  const context = buildConversationContext(recentMessages.slice(-4))

  const prompt = `${persona.systemPrompt}

Conversation:
${context}

They said: "${lastIncomingMessage}"

Generate 3 DIFFERENT short replies (max 5 words each). Make them varied, natural, and conversational.

Return ONLY a JSON array with exactly 3 strings:`

  try {
    console.log(`💭 Generating replies for ${contactName}...`)
    const result = await generateWithTemperature(prompt, 0.85)
    const raw = result.text().trim()
    
    // Try to extract JSON
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length >= 3) {
        console.log(`✅ Smart replies ready`)
        return parsed.slice(0, 3)
      }
    }
  } catch (err) {
    console.error(`❌ Smart reply error:`, err)
  }
  
  // Fallback varied replies
  const replies = [
    ['Yeah!', 'For sure!', 'Let me think...'],
    ['Haan!', 'Sure', 'Hmm maybe'],
    ['Lol yes!', 'Nope', 'Tell me more'],
    ['OMG!', 'Cool!', 'Why tho?'],
    ['Srsly?', 'No way', 'Let\'s go'],
  ]
  
  return replies[Math.floor(Math.random() * replies.length)]
}