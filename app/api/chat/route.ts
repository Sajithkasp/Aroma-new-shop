import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { AROMA_FRAGRANCES } from '@/lib/aromaData'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const groqApiKey = process.env.GROQ_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY

    // Build context about the available fragrances
    const catalogContext = AROMA_FRAGRANCES.map(
      (f) =>
        `• ${f.name} (${f.category}, LKR ${f.price.toLocaleString()}, ${f.volume_ml}ml, Concentration: ${f.concentration} ${f.concentration_pct}%): ${f.description}. Top Notes: ${f.notes_top.join(', ')}. Heart Notes: ${f.notes_heart.join(', ')}. Base Notes: ${f.notes_base.join(', ')}. Longevity: ${f.longevity}. Sillage: ${f.sillage}. Best for: ${f.season}.`
    ).join('\n')

    const systemPrompt = `You are the Master Perfumer and Atelier Sommelier for "AROMA FINE PERFUMERY", a luxury artisanal haute parfumerie based at No. 45 Ward Place, Colombo 07, Sri Lanka.
You speak with elegance, deep olfactory knowledge, sophistication, and warm Sri Lankan hospitality.

Here is the current artisanal catalog:
${catalogContext}

Key policies & details:
- Oil concentration is 30%-35% pure Extrait de Parfum, lasting 14-18+ hours on tropical skin.
- Sustainable aged Ceylon Agarwood and 48-hour fresh harvest organic cinnamon quills.
- Complimentary island-wide express delivery on orders over LKR 10,000.
- Cash on Delivery (COD) and Bank Transfer available island-wide.
- 2 free bespoke 3ml macerated samples with every full flacon order.
- WhatsApp Concierge hotline: +94 77 123 4567.

Help customers discover their ideal fragrance, advise on scent layering, longevity tips, note evolution, gifting, and occasions. Keep your answers refined, knowledgeable, and concise (under 3-4 sentences when possible, unless detailed breakdown is asked).`

    // Priority 1: Groq API (High Speed LLaMA 3.3 70B)
    if (groqApiKey) {
      try {
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content
          }))
        ]

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 500
          })
        })

        if (groqRes.ok) {
          const groqData = await groqRes.json()
          const reply = groqData.choices?.[0]?.message?.content
          if (reply) {
            return NextResponse.json({ reply })
          }
        }
      } catch (e) {
        console.warn('Groq API call fallback:', e)
      }
    }

    // Priority 2: Gemini API
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey })
        const formattedContents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })

        return NextResponse.json({
          reply:
            response.text ||
            'Our Atelier Sommelier is at your service. Which scent family inspires you?'
        })
      } catch (e) {
        console.warn('Gemini API call fallback:', e)
      }
    }

    // Fallback: Intelligent curated responses
    const lastUserMsg = messages[messages.length - 1]?.content || ''
    const lower = lastUserMsg.toLowerCase()
    let reply =
      'Welcome to Aroma Ceylon. Our signature Extrait de Parfum flacons are handcrafted in Colombo with sustainably harvested wild Ceylon Agarwood and pure cinnamon quills. May I assist you with selecting your signature scent?'
    if (lower.includes('oud') || lower.includes('royal')) {
      reply =
        'Ceylon Royal Oud is our flagship 35% Extrait flacon, pairing 12-year-old aged agarwood with smoked ambergris and warm spice. It offers unmatched 16+ hour projection.'
    } else if (lower.includes('cinnamon') || lower.includes('spice') || lower.includes('night')) {
      reply =
        'Midnight Cinnamon Noir captures the organic sweetness of Ceylon quills, French damask rose, and bourbon vanilla. Perfect for intimate evenings and cooler weather.'
    } else if (lower.includes('fresh') || lower.includes('aqua') || lower.includes('summer')) {
      reply =
        'Aqua de Ceylon is formulated specifically for the tropical climate with Indian Ocean sea salt mist, green bergamot, and sunlit ambergris for 14-hour crisp projection.'
    }

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        reply:
          'I am delighted to welcome you to Aroma. How may I guide your fragrance journey today?'
      },
      { status: 200 }
    )
  }
}
