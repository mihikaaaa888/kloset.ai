const PROMPT = `You are a professional fashion analyst. Analyse this clothing item photo and respond with raw JSON only (no markdown fences, no commentary).

Rules:
- Only describe what is clearly visible in the image
- Use null for any field you cannot confidently determine
- primaryColor must be exactly one of: Black, White, Navy, Charcoal, Camel, Tan, Cream, Beige, Blush, Dusty Rose, Burgundy, Forest Green, Olive, Sage, Rust, Terracotta, Cobalt, Sky Blue, Lavender, Plum, Gold, Silver, Brown, Grey
- category must be exactly one of: tops, bottoms, dresses, outerwear, shoes, accessories
- pattern must be exactly one of: solid, striped, checked, floral, abstract, animal-print, geometric, other
- fit must be exactly one of: slim, regular, relaxed, oversized, fitted (or null)
- formality must be exactly one of: casual, smart casual, business, formal, black tie (or null)
- seasons is an array from: spring, summer, autumn, winter, all-season

Respond with this exact JSON structure:
{
  "category": string | null,
  "subcategory": string | null,
  "primaryColor": string | null,
  "secondaryColors": string[],
  "material": string | null,
  "pattern": string | null,
  "fit": string | null,
  "formality": string | null,
  "seasons": string[],
  "confidence": { "category": number, "color": number, "material": number }
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageData, mediaType } = req.body ?? {}

  if (!imageData || typeof imageData !== 'string') {
    return res.status(400).json({ error: 'imageData (base64 string) is required' })
  }
  if (!mediaType || !['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be image/jpeg, image/png, or image/webp' })
  }

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.json({
      analysis: null,
      source: 'stub',
      message: 'Add GROQ_API_KEY to Vercel environment variables to enable AI analysis.',
    })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${imageData}` },
            },
            { type: 'text', text: PROMPT },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter ${response.status}: ${err}`)
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const analysis = JSON.parse(cleaned)

    return res.json({ analysis, source: 'groq' })
  } catch (e) {
    console.error('[analyze-image] OpenRouter error:', e?.message ?? e)
    return res.status(500).json({
      error: 'AI analysis failed. You can still add the item manually.',
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
