/**
 * Kloset.ai API Server
 *
 * Runs on port 3001 (proxied from Vite at /api/*).
 * Reads GROQ_API_KEY from .env in the project root.
 *
 * Start: npm run server
 * Start both servers: npm run dev:all
 */

import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
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
  // .env not found — variables can still be set in the environment
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '15mb' }))

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    hasExaKey: !!process.env.EXA_API_KEY,
    timestamp: new Date().toISOString(),
  })
})

// ─── Image search (Pexels) ────────────────────────────────────────────────────

app.get('/api/search-images', async (req, res) => {
  const q = String(req.query.q || 'fashion clothing').trim().slice(0, 100)
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10))
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    return res.json({ photos: [], noKey: true })
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=18&page=${page}&orientation=portrait`,
      { headers: { Authorization: apiKey } }
    )

    if (!response.ok) throw new Error(`Pexels ${response.status}`)

    const data = await response.json()
    const photos = (data.photos ?? []).map((p) => ({
      id: p.id,
      url: p.src.medium,      // ~1200px wide
      thumbUrl: p.src.small,  // ~280px wide
      alt: p.alt || q,
      photographer: p.photographer,
    }))

    return res.json({ photos, totalResults: data.total_results ?? 0, page })
  } catch (e) {
    console.error('[search-images] Pexels error:', e?.message)
    return res.status(500).json({ photos: [], error: 'Image search failed.' })
  }
})

// ─── Analyze clothing image ───────────────────────────────────────────────────

const PROMPT = `You are a professional fashion analyst. Analyse this clothing item photo and respond with raw JSON only (no markdown fences, no commentary).

Rules:
- Only describe what is clearly visible in the image
- Use null for any field you cannot confidently determine
- name is a short, natural item name like a retailer would use, e.g. "Black Ribbed Turtleneck" or "Camel Wool Overcoat" — colour + material/pattern + garment type, no brand names
- primaryColor must be exactly one of: Black, White, Navy, Charcoal, Camel, Tan, Cream, Beige, Blush, Dusty Rose, Burgundy, Forest Green, Olive, Sage, Rust, Terracotta, Cobalt, Sky Blue, Lavender, Plum, Gold, Silver, Brown, Grey
- category must be exactly one of: tops, bottoms, dresses, outerwear, shoes, accessories
- pattern must be exactly one of: solid, striped, checked, floral, abstract, animal-print, geometric, other
- fit must be exactly one of: slim, regular, relaxed, oversized, fitted (or null)
- formality must be exactly one of: casual, smart casual, business, formal, black tie (or null)
- seasons is an array from: spring, summer, autumn, winter, all-season
- occasions is an array of the occasions this piece realistically suits, from: work, casual, formal, date-night, weekend, travel, gym, special-event — pick 1-4 that fit, based on the garment's formality and style

Respond with this exact JSON structure:
{
  "name": string | null,
  "category": string | null,
  "subcategory": string | null,
  "primaryColor": string | null,
  "secondaryColors": string[],
  "material": string | null,
  "pattern": string | null,
  "fit": string | null,
  "formality": string | null,
  "seasons": string[],
  "occasions": string[],
  "confidence": { "category": number, "color": number, "material": number }
}`

// Shared by both /api/analyze-image (upload) and /api/analyze-image-url
// (pasted URL / Pexels pick) — same vision call either way, only the source
// of the base64 bytes differs.
async function runVisionAnalysis(imageData, mediaType) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { analysis: null, source: 'stub', message: 'Add GROQ_API_KEY to your .env file to enable AI analysis.' }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
    throw new Error(`Groq ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const analysis = JSON.parse(cleaned)

  return { analysis, source: 'groq' }
}

app.post('/api/analyze-image', async (req, res) => {
  const { imageData, mediaType } = req.body ?? {}

  if (!imageData || typeof imageData !== 'string') {
    return res.status(400).json({ error: 'imageData (base64 string) is required' })
  }
  if (!mediaType || !['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be image/jpeg, image/png, or image/webp' })
  }

  try {
    const result = await runVisionAnalysis(imageData, mediaType)
    return res.json(result)
  } catch (e) {
    console.error('[analyze-image] Groq error:', e?.message ?? e)
    return res.status(500).json({
      error: 'AI analysis failed. You can still add the item manually.',
      details: e instanceof Error ? e.message : String(e),
    })
  }
})

// Fetches an arbitrary image URL (pasted by the user, or picked from a Pexels
// search result) server-side and runs the same vision analysis on it — done
// server-side specifically because reading the bytes of a cross-origin image
// from the browser is blocked by CORS for most sites (display via <img> works
// without CORS, but fetch()-ing the bytes to analyze does not).
app.post('/api/analyze-image-url', async (req, res) => {
  const { url } = req.body ?? {}
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' })
  }

  let parsed
  try {
    parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
  } catch {
    return res.status(400).json({ error: 'Invalid image URL.' })
  }

  try {
    const imgRes = await fetch(parsed.toString())
    if (!imgRes.ok) throw new Error(`Fetch ${imgRes.status}`)

    const contentType = (imgRes.headers.get('content-type') || '').split(';')[0].trim()
    const mediaType = ['image/jpeg', 'image/png', 'image/webp'].includes(contentType)
      ? contentType
      : 'image/jpeg'

    const buf = Buffer.from(await imgRes.arrayBuffer())
    if (buf.length > 12 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image is too large to analyse.' })
    }
    const imageData = buf.toString('base64')

    const result = await runVisionAnalysis(imageData, mediaType)
    return res.json(result)
  } catch (e) {
    console.error('[analyze-image-url] error:', e?.message ?? e)
    return res.status(500).json({
      error: 'AI analysis failed. You can still add the item manually.',
      details: e instanceof Error ? e.message : String(e),
    })
  }
})

// ─── Live web shopping search (Exa) ───────────────────────────────────────────

const RETAILER_DOMAINS = {
  zara: 'zara.com',
  hm: 'hm.com',
  cos: 'cos.com',
  uniqlo: 'uniqlo.com',
  mango: 'mango.com',
  stories: 'stories.com',
  everlane: 'everlane.com',
}
const RETAILER_NAMES = {
  'zara.com': 'Zara',
  'hm.com': 'H&M',
  'cos.com': 'COS',
  'uniqlo.com': 'Uniqlo',
  'mango.com': 'Mango',
  'stories.com': '& Other Stories',
  'everlane.com': 'Everlane',
}

// Identical requests re-hit Exa's paid API otherwise. Process-local, resets
// on restart — fine for a single-instance dev/personal-scale deployment.
const webShopCache = new Map()
const WEB_SHOP_CACHE_TTL_MS = 10 * 60 * 1000

function domainOf(url) {
  try {
    // Strips www., www2., etc — H&M's site serves from www2.hm.com.
    return new URL(url).hostname.replace(/^www\d*\./, '')
  } catch {
    return ''
  }
}

// Suffix match, not exact — retailers serve from regional subdomains Exa
// crawls independently (ae.hm.com, en_ca.hm.com, etc), all still "H&M".
function retailerNameFor(domain) {
  for (const [known, name] of Object.entries(RETAILER_NAMES)) {
    if (domain === known || domain.endsWith(`.${known}`)) return name
  }
  return domain
}

// Exa's /search API has no region/language filter, so a domain-only match
// can surface a non-US, non-English storefront page (e.g. zara.com/es/...,
// or ae.hm.com where the region lives in the subdomain, not the path) above
// a US one. This doesn't remove anything — a niche query might only exist on
// a regional page — it just sorts likely-US/English pages first. Retailers
// don't agree on a country-code standard (Zara uses "uk", ISO uses "gb"), so
// both are covered; checked against path AND hostname to catch either style.
const NON_US_LOCALE_RE = /(?:^|[./_-])(en[-_](gb|uk|ca|au|ie|in|sg|hk|nz|ww|eu)|es|fr|de|it|nl|pt|se|dk|no|fi|pl|ru|ja|jp|ko|kr|zh|cn|tw|ar|ae|sa|mx|br|tr|gb|uk|ca|au|eu)(?:[-_./]|$)/i

function isLikelyNonUS(url) {
  try {
    const u = new URL(url)
    return NON_US_LOCALE_RE.test(u.pathname) || NON_US_LOCALE_RE.test(u.hostname.replace(/^www\d*\./, ''))
  } catch {
    return false
  }
}

app.post('/api/web-shop-search', async (req, res) => {
  const { query, retailers } = req.body ?? {}

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query is required' })
  }

  const includeDomains = (Array.isArray(retailers) && retailers.length
    ? retailers.filter((r) => RETAILER_DOMAINS[r]).map((r) => RETAILER_DOMAINS[r])
    : Object.values(RETAILER_DOMAINS))

  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    console.log('[web-shop-search] no EXA_API_KEY set — returning empty results')
    return res.json({ results: [], noKey: true })
  }

  const trimmedQuery = query.trim().slice(0, 200)
  const cacheKey = `${trimmedQuery.toLowerCase()}|${includeDomains.slice().sort().join(',')}`
  const cached = webShopCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[web-shop-search] cache hit for "${trimmedQuery}"`)
    return res.json({ results: cached.results })
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: trimmedQuery,
        type: 'auto',
        numResults: 12,
        includeDomains,
        contents: {
          text: { maxCharacters: 280 },
          highlights: true,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Exa ${response.status}: ${err}`)
    }

    const data = await response.json()
    const results = (data.results ?? []).map((r) => {
      const domain = domainOf(r.url)
      return {
        id: r.id ?? r.url,
        title: r.title ?? 'View item',
        url: r.url,
        domain,
        retailer: retailerNameFor(domain),
        snippet: (r.highlights?.[0] ?? r.text ?? '').trim().slice(0, 200),
        imageUrl: r.image ?? null,
      }
    })

    // Stable sort — keeps Exa's relevance order within each group, just
    // prefers likely-US/English pages over regional ones.
    results.sort((a, b) => Number(isLikelyNonUS(a.url)) - Number(isLikelyNonUS(b.url)))

    webShopCache.set(cacheKey, { results, expiresAt: Date.now() + WEB_SHOP_CACHE_TTL_MS })
    const nonUSCount = results.filter((r) => isLikelyNonUS(r.url)).length
    console.log(`[web-shop-search] "${trimmedQuery}" (${includeDomains.join(',')}) → ${results.length} results (${nonUSCount} non-US deprioritized)`)
    return res.json({ results })
  } catch (e) {
    console.error('[web-shop-search] Exa error:', e?.message ?? e)
    return res.status(500).json({ error: 'Live shopping search failed. Try again in a moment.' })
  }
})

// ─── Stylist chat ─────────────────────────────────────────────────────────────

// Groq rejects an oversized request body outright (413), which otherwise
// surfaces to the user as an opaque 500 with no clue why. A giant paste into
// the chat box, or a wardrobe/shop summary that's grown unexpectedly large,
// are the realistic ways this happens — cap everything defensively so one
// runaway field can't blow up the whole request.
const MAX_MESSAGE_CHARS = 4000
const MAX_SUMMARY_CHARS = 6000

function cap(str, max) {
  if (typeof str !== 'string' || str.length <= max) return str
  return str.slice(0, max) + '\n…(truncated)'
}

// Calls Groq's agentic 'compound' model. Throws with a `.status` set to the
// upstream HTTP status so the caller can tell a capacity issue (429/413)
// apart from a real failure.
async function callGroq(apiKey, systemPrompt, recentMessages) {
  const requestBody = JSON.stringify({
    model: 'groq/compound',
    max_tokens: 600,
    messages: [
      { role: 'system', content: systemPrompt },
      ...recentMessages,
    ],
  })

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: requestBody,
  })

  if (!response.ok) {
    const errText = await response.text()
    const error = new Error(`Groq ${response.status}: ${errText}`)
    error.status = response.status
    throw error
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? null
}

// Fallback path when Groq is unavailable (down, erroring, or rate-limited).
// Claude's Messages API takes the system prompt as its own field rather than
// a role in the messages array, and requires the array to start with a user
// turn — both handled here rather than forcing the Groq-shaped call site to
// know about it.
async function callClaude(apiKey, systemPrompt, recentMessages) {
  const anthropic = new Anthropic({ apiKey })

  const firstUserIdx = recentMessages.findIndex((m) => m.role === 'user')
  const claudeMessages = (firstUserIdx <= 0 ? recentMessages : recentMessages.slice(firstUserIdx))
    .map((m) => ({ role: m.role, content: m.content }))

  if (claudeMessages.length === 0) return null

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 600,
    system: systemPrompt,
    messages: claudeMessages,
  })

  return response.content?.find((b) => b.type === 'text')?.text ?? null
}

app.post('/api/chat', async (req, res) => {
  const rawBody = req.body ?? {}
  const messages = Array.isArray(rawBody.messages)
    ? rawBody.messages.map((m) => ({ ...m, content: cap(m.content, MAX_MESSAGE_CHARS) }))
    : rawBody.messages
  const wardrobeSummary = cap(rawBody.wardrobeSummary, MAX_SUMMARY_CHARS)
  const wardrobeGapsSummary = cap(rawBody.wardrobeGapsSummary, MAX_SUMMARY_CHARS)
  const profileSummary = cap(rawBody.profileSummary, MAX_SUMMARY_CHARS)
  const stylePreferencesSummary = cap(rawBody.stylePreferencesSummary, MAX_SUMMARY_CHARS)
  const shopSummary = cap(rawBody.shopSummary, MAX_SUMMARY_CHARS)

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const groqKey = process.env.GROQ_API_KEY
  const claudeKey = process.env.CLAUDE_API_KEY

  if (!groqKey && !claudeKey) {
    return res.json({
      reply: "I'd love to help you style your wardrobe! Add a Groq or Claude API key to enable AI chat.",
      source: 'stub',
    })
  }

  const systemPrompt = `You are Kaia, a warm, knowledgeable personal AI stylist and personal shopper. You speak in a conversational, friendly tone — like a stylish friend who really knows fashion AND actually goes shopping with them. Every reply should feel like it's about THIS person specifically, not generic style advice — use the details below to make that true.
${profileSummary ? `\nAbout this person: ${profileSummary}` : ''}
${wardrobeSummary ? `\nClothes they ACTUALLY OWN (use these for outfit building):\n${wardrobeSummary}` : '\nTheir wardrobe is still being built — encourage them to add items.'}
${wardrobeGapsSummary ? `\nWardrobe patterns and gaps (reason with this, don't recite it back verbatim — it's what makes a recommendation actually personal):\n${wardrobeGapsSummary}` : ''}
${stylePreferencesSummary ? `\nStyle pieces they LOVE but don't necessarily own (use to understand their taste, not as outfit components):\n${stylePreferencesSummary}` : ''}
${shopSummary ? `\nPieces available to buy or rent on the Discover page (Kloset's own curated picks):\n${shopSummary}\nWhen you suggest one, name the piece and its approximate price, mention it can be bought or rented, and point them to the Discover page (it has a budget filter).` : ''}

CRITICAL RULES:
- Only build OUTFITS using pieces they ACTUALLY OWN
- Style preferences and favourites show their taste — use them to judge fit, never treat them as owned
- When wardrobe is small, be creative with combinations and suggest what to add next
- If a good outfit needs a piece they don't own, or a real gap from their wardrobe patterns is worth filling, you may recommend ONE piece — either from Kloset's own catalog above, OR by naming a REAL external brand/retailer whose aesthetic, quality, and price point genuinely match this specific person (choose from: Zara, H&M, COS, Uniqlo, Mango, & Other Stories, Everlane — pick whichever actually fits them, don't default to the same one every time). Name that ONE brand exactly once and don't mention any other retailer by name in the same reply — the brand you name is what the real listing below your message gets locked to, so naming a second one creates a contradiction
- Ground every external recommendation in something specific about them: a colour they're missing, a formality gap, a favourite they own, their occupation/lifestyle — say why it complements their closet, not just that it's nice
- When you recommend a specific external piece, end that recommendation with a tag on its own line: [[SHOP: <short search query describing the item>]] — e.g. [[SHOP: pink satin top]]. This tag is machine-readable and gets replaced with a real, live product link, so only include it for one genuine, specific recommendation per reply, never for hypotheticals or general musing
- CRITICAL: you have NO live inventory access and have not "found," "seen," or "spotted" any specific external item — not even in hedged form ("look for a relaxed-fit blouse, think silk-blend or jersey"). Any fabric, fit, drape, or subcategory guess you add is a fiction that may contradict the real listing that appears below your message once the [[SHOP: ...]] tag resolves. State ONLY: the broad category (top/dress/etc — not a specific cut like "blouse" or "jersey"), a general colour direction, the brand, and the personal reasoning (why this direction fits their gap/palette/occasion). Nothing else about the item itself. E.g. correct: "A soft blue piece from Zara would round out your look without clashing with your neutrals." Wrong: "A relaxed-fit, slightly structured blouse in a drapey silk-blend from Zara."
- Don't invent specific prices, stock, or exact product names for external brands
- Keep responses concise (2–4 sentences for simple questions, more for outfit requests)
- When building an outfit, list pieces clearly
- Be encouraging, warm, and fashion-forward`

  const recentMessages = messages.slice(-12)

  // Sized to catch exactly this class of bug — a huge paste into the chat
  // input, or a wardrobe/shop summary that's grown unexpectedly large — by
  // showing which piece is bloated before a provider's size limit forces a guess.
  console.log(
    `[chat] sending: systemPrompt=${systemPrompt.length}c ` +
    `wardrobeSummary=${(wardrobeSummary ?? '').length}c ` +
    `wardrobeGapsSummary=${(wardrobeGapsSummary ?? '').length}c ` +
    `shopSummary=${(shopSummary ?? '').length}c ` +
    `history=${recentMessages.length}msgs/${recentMessages.reduce((n, m) => n + (m.content?.length ?? 0), 0)}c`
  )

  let reply = null
  let source = null
  let lastError = null

  if (groqKey) {
    try {
      reply = await callGroq(groqKey, systemPrompt, recentMessages)
      source = 'groq'
    } catch (e) {
      lastError = e
      const isCapacityIssue = e.status === 429 || e.status === 413
      console.warn(`[chat] Groq ${isCapacityIssue ? 'capacity limit' : 'error'}: ${e.message}`)
    }
  }

  if (!reply && claudeKey) {
    try {
      reply = await callClaude(claudeKey, systemPrompt, recentMessages)
      source = 'claude-fallback'
      console.log(`[chat] served by Claude fallback${groqKey ? ' (Groq failed first)' : ' (no Groq key set)'}`)
    } catch (e) {
      console.error('[chat] Claude fallback also failed:', e?.message ?? e)
      lastError = e
    }
  }

  if (reply) {
    const hasShopTag = /\[\[SHOP:/i.test(reply)
    console.log(`[chat] ${messages.length} messages in → reply ${reply.length} chars via ${source}${hasShopTag ? ' (includes [[SHOP]] tag)' : ''}`)
    return res.json({ reply, source })
  }

  // Both providers unavailable or failed. A pure capacity issue (and no
  // Claude key to fall back to) still gets the friendly in-character
  // message; anything else is a real error.
  const isCapacityIssue = lastError?.status === 429 || lastError?.status === 413
  if (isCapacityIssue) {
    return res.json({
      reply: "I'm juggling a lot of style requests right now — give me about 10-15 seconds and ask again!",
      source: 'rate-limit',
    })
  }

  console.error('[chat] All providers failed:', lastError?.message ?? 'no providers configured')
  return res.status(500).json({ reply: "I'm having a moment — please try again!", source: 'error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Kloset API server → http://localhost:${PORT}`)
  if (!process.env.GROQ_API_KEY) {
    console.log('  ⚠  GROQ_API_KEY not set — AI image analysis disabled')
    console.log('     Add it to .env and restart the server to enable it.')
  } else {
    console.log('  ✓  GROQ_API_KEY detected — AI image analysis ready')
  }
  if (process.env.CLAUDE_API_KEY) {
    console.log('  ✓  CLAUDE_API_KEY detected — chat will fall back to Claude if Groq fails')
  }
  console.log('')
})
