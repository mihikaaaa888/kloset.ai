export const COLOUR_MAP: Record<string, string> = {
  Black: '#1A1A1A',
  White: '#F5F4F0',
  Navy: '#1B2A4A',
  Charcoal: '#3D3D3A',
  Camel: '#C19A6B',
  Tan: '#D4A96A',
  Cream: '#EDE9E2',
  Beige: '#C9B99A',
  Blush: '#E8B4B8',
  'Dusty Rose': '#C9889A',
  Burgundy: '#800020',
  'Forest Green': '#355E3B',
  Olive: '#6B7C47',
  Sage: '#8FA88A',
  Rust: '#B7410E',
  Terracotta: '#C4622D',
  Cobalt: '#0047AB',
  'Sky Blue': '#87CEEB',
  Lavender: '#B57EDC',
  Plum: '#8E4585',
  Gold: '#C9A96E',
  Silver: '#A8A8A8',
  Brown: '#795548',
  Grey: '#9E9E9E',
}

export const COLOUR_PALETTE = Object.entries(COLOUR_MAP).map(([name, hex]) => ({ name, hex }))

export function colourNameToHex(name: string): string {
  return COLOUR_MAP[name] ?? '#C9B99A'
}

export function isLightColour(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}
