// Kaia is told (see the system prompt in index.mjs) to write each outfit as
// one "- Slot: piece" line per slot. The model still slips — two bottoms,
// a tee under a tee, a dress plus trousers, or a shop pick for a slot the
// outfit already fills — so the reply is checked here, and any problems are
// fed back for one rewrite before it reaches the user.

const SLOT_ALIASES = {
  top: 'top',
  bottom: 'bottom',
  bottoms: 'bottom',
  dress: 'dress',
  outerwear: 'outerwear',
  layer: 'outerwear',
  jacket: 'outerwear',
  shoes: 'shoes',
  footwear: 'shoes',
  accessory: 'accessory',
  accessories: 'accessory',
}

// Wardrobe categories (src/types ClothingCategory) → outfit slot.
const CATEGORY_SLOT = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'dress',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessories: 'accessory',
}

// "- Top: White linen shirt", "* **Bottom:** Blue jeans (to buy)", "• Shoes – …"
const SLOT_LINE_RE = /^\s*(?:[-*•]|\d+[.)])\s*\**\s*([a-z]+)\s*\**\s*[:–—-]\s*\**\s*(.+)$/i
const SHOP_TAG_RE = /\[\[SHOP:\s*(?:([a-z]+)\s*\|\s*)?([^\]]+)\]\]/i
const TO_BUY_RE = /\(\s*to buy\s*\)/i

// Groups consecutive slot lines into outfits. Blank lines don't split an
// outfit; any other text (an "Outfit 2" heading, a paragraph) does — which
// is what keeps "3 outfits" replies from reading as one outfit with 3 tops.
function parseOutfits(reply) {
  const outfits = []
  let current = null
  for (const line of reply.split('\n')) {
    if (!line.trim()) continue
    const m = line.match(SLOT_LINE_RE)
    const slot = m && SLOT_ALIASES[m[1].toLowerCase()]
    if (!slot) {
      current = null
      continue
    }
    if (!current) {
      current = []
      outfits.push(current)
    }
    const piece = m[2].replace(/\*+/g, '').trim()
    current.push({ slot, piece, toBuy: TO_BUY_RE.test(piece) })
  }
  return outfits
}

// Longest wardrobe name contained in the line wins, so "Blue jeans" doesn't
// match a line about "Blue jeans jacket".
function findOwnedItem(piece, wardrobeItems) {
  const lower = piece.toLowerCase()
  let best = null
  for (const item of wardrobeItems) {
    const name = item.name?.toLowerCase()
    if (name && lower.includes(name) && (!best || name.length > best.name.length)) best = item
  }
  return best
}

/**
 * @param {string} reply
 * @param {{ name: string, category: string }[]} wardrobeItems
 * @returns {string[]} human-readable problems, empty when the reply is fine
 */
export function findOutfitProblems(reply, wardrobeItems = []) {
  const problems = []
  const outfits = parseOutfits(reply)

  for (const [idx, pieces] of outfits.entries()) {
    const label = outfits.length > 1 ? `Outfit ${idx + 1}` : 'The outfit'

    // A piece labelled as the wrong slot hides a duplicate ("Top: Denim
    // shorts" next to "Bottom: Blue jeans"), so correct slots from the
    // wardrobe's own category before counting.
    for (const p of pieces) {
      if (p.toBuy) continue
      const owned = findOwnedItem(p.piece, wardrobeItems)
      const actualSlot = owned && CATEGORY_SLOT[owned.category]
      if (actualSlot && actualSlot !== p.slot) {
        problems.push(`${label} lists "${owned.name}" as ${p.slot}, but it is a ${actualSlot} piece in their wardrobe.`)
        p.slot = actualSlot
      }
    }

    const counts = {}
    for (const p of pieces) counts[p.slot] = (counts[p.slot] ?? 0) + 1

    for (const slot of ['top', 'bottom', 'dress', 'outerwear', 'shoes']) {
      if (counts[slot] > 1) {
        const names = pieces.filter((p) => p.slot === slot).map((p) => `"${p.piece}"`).join(' and ')
        problems.push(`${label} has ${counts[slot]} ${slot} pieces (${names}) — use exactly one ${slot}.`)
      }
    }
    if (counts.dress && (counts.top || counts.bottom)) {
      problems.push(`${label} pairs a dress with a separate top/bottom — a dress replaces both.`)
    }
    if (counts.accessory > 2) {
      problems.push(`${label} has ${counts.accessory} accessories — keep it to at most 2, of different kinds.`)
    }
  }

  // The shop pick has to fill a gap in the outfit it's for, not double up
  // on a slot the user's own piece already covers.
  const shop = reply.match(SHOP_TAG_RE)
  const shopSlot = shop?.[1] && SLOT_ALIASES[shop[1].toLowerCase()]
  if (shop && !shopSlot) {
    problems.push('The [[SHOP: ...]] tag is missing its slot — write it as [[SHOP: <slot> | <search query>]].')
  }
  if (shopSlot) {
    const target = outfits.find((pieces) => pieces.some((p) => p.toBuy)) ?? (outfits.length === 1 ? outfits[0] : null)
    const clash = target?.find((p) => !p.toBuy && p.slot === shopSlot && shopSlot !== 'accessory')
    if (clash) {
      problems.push(`The piece to buy is a ${shopSlot}, but the outfit already has "${clash.piece}" as its ${shopSlot} — recommend a piece for a slot the outfit is missing instead.`)
    }
  }

  return problems
}
