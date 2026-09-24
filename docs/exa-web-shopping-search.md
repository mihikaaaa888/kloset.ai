# Spec: Live Web Shopping Search (Exa)

## Problem

Kloset's "Discover" catalog is hand-curated sample data. Its Buy/Rent buttons
(`CatalogItem.shopUrl` / `rentUrl`, built in `src/lib/catalogData.ts`) just
open a Google Shopping search — they don't point at anything real.

Goal: let a user type a plain request like **"pink top"** and see actual,
current product links from **Zara** and **H&M**, not a Google redirect.

## Approach

Use [Exa](https://exa.ai)'s Search API as a retailer-restricted web search.
Exa takes a natural-language query and returns ranked, real URLs with
extracted page content — a good fit for "pink top" → real product pages,
without us scraping Zara/H&M ourselves (fragile, ToS-risky, and duplicative
of what Exa already indexes).

Flow:

```
User types "pink top"
  → POST /api/web-shop-search { query, retailers? }
  → server calls Exa /search with includeDomains: [zara.com, hm.com]
  → server normalizes results → { title, url, retailer, domain, snippet, imageUrl }
  → frontend renders a result grid, each card links out to the real product page
```

This follows the existing pattern in the codebase: `GROQ_API_KEY` and
`PEXELS_API_KEY` are read server-side only in `server/index.mjs` (and mirrored
in `server/app.mjs`, served on Netlify via `netlify/functions/api.mjs`), never exposed to the browser. `EXA_API_KEY` does
the same.

## API contract

### `POST /api/web-shop-search`

Request:
```json
{ "query": "pink top", "retailers": ["zara", "hm"] }
```
`retailers` is optional; omitting it searches both.

Response (200):
```json
{
  "results": [
    {
      "id": "abc123",
      "title": "Satin Halter Top",
      "url": "https://www.zara.com/us/en/satin-halter-top-p12345.html",
      "domain": "zara.com",
      "retailer": "Zara",
      "snippet": "Halter top in pink satin with a fitted...",
      "imageUrl": "https://static.zara.net/photos/...jpg"
    }
  ]
}
```
No key configured → `{ "results": [], "noKey": true }` (200), so the UI can
show a setup hint instead of an error, matching the Groq stub pattern.
Upstream failure → 500 with a user-safe `error` message.

### Exa call made server-side

```
POST https://api.exa.ai/search
Headers: x-api-key: <EXA_API_KEY>
Body: {
  "query": "<user query>",
  "type": "auto",
  "numResults": 12,
  "includeDomains": ["zara.com", "hm.com"],   // filtered by requested retailers
  "contents": { "text": { "maxCharacters": 280 }, "highlights": true }
}
```

Normalization:
- `domain` = hostname of `result.url`, `www.` stripped
- `retailer` = looked up from a small `{ 'zara.com': 'Zara', 'hm.com': 'H&M' }`
  map (adding a retailer later is a one-line change)
- `snippet` = `result.highlights?.[0] ?? result.text ?? ''`, trimmed
- `imageUrl` = `result.image ?? null` (Exa returns page OG-image when
  available; not guaranteed per-result, so the UI must handle `null` with a
  retailer-colored placeholder rather than a broken `<img>`)

### Cost / rate control

Exa bills per search+content call. The server keeps an in-memory
`Map<cacheKey, { results, expiresAt }>` (10 min TTL) keyed by
`query|retailers`, so identical repeat searches in a session don't re-hit
Exa. This is process-local (resets on restart) — adequate for a
single-instance dev/personal-scale deployment, not a distributed cache.

## Frontend

- `src/lib/webShopService.ts` — `searchWebShop(query, retailers?)`, thin
  fetch wrapper, same shape as `chatService.ts`.
- `src/components/discover/WebShopSearch.tsx` — search input + retailer
  filter chips (All / Zara / H&M) + result grid. States: idle (suggestion
  chips like "pink top", "black blazer"), loading, empty, no-key, error.
  Each result card: image-or-placeholder, retailer badge, title, snippet,
  "Shop at {retailer} ↗" link (`target="_blank" rel="noreferrer"`).
- Mounted at the top of `DiscoverPage.tsx`, above the existing curated
  catalog grid — the catalog and its Add-to-Kloset flow are untouched.

## Update: chat integration + more retailers

Both items originally deferred here have since shipped:

- **Retailers**: `RETAILER_DOMAINS`/`RETAILER_NAMES` now also include COS,
  Uniqlo, Mango, & Other Stories, and Everlane (`server/index.mjs`,
  `server/app.mjs`). The Discover search's retailer chips and
  `Retailer` type (`src/lib/webShopService.ts`) were extended to match.
- **Chat integration**: Kaia's system prompt (`server/app.mjs`, `/api/chat`)
  now permits recommending a real external brand piece when it genuinely
  complements a wardrobe gap, and is instructed to end that recommendation
  with a `[[SHOP: <query>]]` tag. `StylistChat.tsx` strips that tag from the
  displayed text and uses it to run a live search via `searchWebShop`,
  rendering up to 3 real product links inline under her message
  (`ExternalShopSuggestion`). If no key is set or the search fails, no card
  renders — the reply text alone still stands.
- Chat's personalization also now includes a wardrobe gap summary (missing
  categories, dominant colours, formal-wear gap, favourites, most-worn) built
  in `src/lib/chatService.ts`'s `buildWardrobeGapsSummary` — this is what lets
  Kaia's external recommendations be about a genuine gap rather than a
  generic pick.

## Explicitly out of scope for this pass

- Price/size/availability extraction — Exa gives page text/snippets, not
  structured product data. Showing a snippet and linking out avoids
  asserting a price we can't verify.
- Persisting the resolved `[[SHOP: ...]]` links to chat history — they're
  re-fetched (from the 10-min server cache when possible) if the chat is
  reloaded, rather than stored per-message. Fine at personal scale; would
  need `ChatMessage` to carry structured data if this needs to survive
  reloads without a re-fetch.

## Setup

Add to `.env`:
```
EXA_API_KEY=your-key-here
```
Get one at exa.ai. Without it, the search still renders but shows a
"connect a key to enable live search" state, same as the existing Groq/Pexels
stub behavior.
