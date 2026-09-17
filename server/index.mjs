/**
 * Kloset.ai API Server
 *
 * Runs on port 3001 (proxied from Vite at /api/*).
 * Reads ANTHROPIC_API_KEY from .env in the project root.
 *
 * Start: npm run server
 * Start both servers: npm run dev:all
 */

import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ─── Load .env ────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env')

try {
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
} catch {
  // .env not found — that's fine; variables can still be set in the environment
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '15mb' })) // images arrive as base64

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  })
})

// ─── Analyze clothing image ───────────────────────────────────────────────────
//
// Request body: { imageData: string (base64), mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }
// Response:     { analysis: ClothingAnalysis | null, source: 'anthropic' | 'stub', message?: string }
//
// ClothingAnalysis shape:
// {
//   category:        'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories' | null
//   subcategory:     string | null
//   primaryColor:    string | null    (matches COLOUR_MAP keys in colourUtils.ts)
//   secondaryColors: string[]
//   material:        string | null    ('unknown' when not determinable from image)
//   pattern:         'solid' | 'striped' | 'checked' | 'floral' | 'abstract' | 'animal-print' | 'geometric' | 'other' | null
//   fit:             'slim' | 'regular' | 'relaxed' | 'oversized' | 'fitted' | null
//   formality:       'casual' | 'smart casual' | 'business' | 'formal' | 'black tie' | null
//   seasons:         Array<'spring' | 'summer' | 'autumn' | 'winter' | 'all-season'>
//   tags:            string[]
//   confidence:      Record<string, number>   (0–1 per field)
// }

app.post('/api/analyze-image', async (req, res) => {
  const { imageData, mediaType } = req.body ?? {}

  if (!imageData || typeof imageData !== 'string') {
    return res.status(400).json({ error: 'imageData (base64 string) is required' })
  }
  if (!mediaType || !['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be image/jpeg, image/png, or image/webp' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  // ── Stub response (no API key) ───────────────────────────────────────────────
  if (!apiKey) {
    return res.json({
      analysis: null,
      source: 'stub',
      message: 'AI analysis is not yet enabled. Add ANTHROPIC_API_KEY to your .env file to activate it.',
    })
  }

  // ── Anthropic API call ───────────────────────────────────────────────────────
  // Uncomment and implement this section after adding your API key.
  //
  // import Anthropic from '@anthropic-ai/sdk'
  //
  // try {
  //   const client = new Anthropic({ apiKey })
  //
  //   const systemPrompt = `You are a professional fashion analyst. Analyze clothing items from photos and return structured JSON.
  //
  // Rules:
  // - Only describe what is clearly visible in the image
  // - Use 'unknown' for material, fit, etc. when not determinable from the photo
  // - Do not invent or assume details that cannot be seen
  // - primaryColor must be one of: Black, White, Navy, Cream, Beige, Charcoal, Grey, Camel, Tan, Brown,
  //   Burgundy, Rust, Terracotta, Olive, Forest Green, Sage, Blush, Dusty Rose, Lavender, Cobalt,
  //   Sky Blue, Gold, Silver, other
  // - category must be: tops, bottoms, dresses, outerwear, shoes, or accessories
  // - confidence values are 0.0–1.0`
  //
  //   const userPrompt = `Analyze this clothing item and respond with JSON only, no markdown fences:
  // {
  //   "category": string | null,
  //   "subcategory": string | null,
  //   "primaryColor": string | null,
  //   "secondaryColors": string[],
  //   "material": string | null,
  //   "pattern": "solid" | "striped" | "checked" | "floral" | "abstract" | "animal-print" | "geometric" | "other" | null,
  //   "fit": "slim" | "regular" | "relaxed" | "oversized" | "fitted" | null,
  //   "formality": "casual" | "smart casual" | "business" | "formal" | "black tie" | null,
  //   "seasons": string[],
  //   "tags": string[],
  //   "confidence": { "category": number, "color": number, "material": number }
  // }`
  //
  //   const response = await client.messages.create({
  //     model: 'claude-sonnet-4-6',
  //     max_tokens: 512,
  //     system: systemPrompt,
  //     messages: [{
  //       role: 'user',
  //       content: [
  //         { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
  //         { type: 'text', text: userPrompt },
  //       ],
  //     }],
  //   })
  //
  //   const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  //   const analysis = JSON.parse(text)
  //   return res.json({ analysis, source: 'anthropic' })
  // } catch (e) {
  //   console.error('[analyze-image] Anthropic error:', e)
  //   return res.status(500).json({
  //     error: 'AI analysis failed. You can still add the item manually.',
  //     details: e instanceof Error ? e.message : String(e),
  //   })
  // }

  // Temporary: API key is set but call not yet implemented
  return res.json({
    analysis: null,
    source: 'stub',
    message: 'API key detected. Uncomment the Anthropic call in server/index.mjs to enable AI analysis.',
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Kloset API server → http://localhost:${PORT}`)

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠  ANTHROPIC_API_KEY not set — AI analysis returns stub data')
    console.log('     Add it to .env and restart the server to enable AI analysis.\n')
  } else {
    console.log('  ✓  ANTHROPIC_API_KEY detected — AI analysis ready\n')
  }
})
