import type { StylePreference, Occasion } from '@/types'
export { COLOUR_PALETTE } from '@/lib/colourUtils'

export const styleOptions: { value: StylePreference; label: string; emoji: string; description: string }[] = [
  { value: 'classic', label: 'Classic', emoji: '🎩', description: 'Timeless, tailored, polished' },
  { value: 'minimalist', label: 'Minimalist', emoji: '◻️', description: 'Clean lines, neutral palette' },
  { value: 'business', label: 'Business', emoji: '💼', description: 'Professional, sharp, confident' },
  { value: 'streetwear', label: 'Streetwear', emoji: '🧢', description: 'Urban, casual, expressive' },
  { value: 'bohemian', label: 'Bohemian', emoji: '🌿', description: 'Free-spirited, layered, earthy' },
  { value: 'athleisure', label: 'Athleisure', emoji: '🏃', description: 'Active, comfortable, functional' },
  { value: 'romantic', label: 'Romantic', emoji: '🌸', description: 'Feminine, soft, elegant' },
  { value: 'eclectic', label: 'Eclectic', emoji: '🎨', description: 'Bold, mixed, creative' },
]

export const occasionOptions: { value: Occasion; label: string; emoji: string }[] = [
  { value: 'work', label: 'Work / Office', emoji: '🏢' },
  { value: 'casual', label: 'Everyday Casual', emoji: '☕' },
  { value: 'formal', label: 'Formal Events', emoji: '🥂' },
  { value: 'date-night', label: 'Date Night', emoji: '✨' },
  { value: 'weekend', label: 'Weekend Outings', emoji: '🌿' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'gym', label: 'Gym / Active', emoji: '💪' },
  { value: 'special-event', label: 'Special Events', emoji: '🎉' },
]


export const ageRangeOptions = [
  { value: 'under-25', label: 'Under 25' },
  { value: '25-34', label: '25 – 34' },
  { value: '35-44', label: '35 – 44' },
  { value: '45-54', label: '45 – 54' },
  { value: '55+', label: '55 +' },
] as const

export const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Fresh pick every morning' },
  { value: 'a-few-times-a-week', label: 'A few times a week', description: 'Plan ahead a little' },
  { value: 'weekly', label: 'Weekly', description: 'A curated weekly edit' },
  { value: 'on-demand', label: 'On demand', description: 'Only when I ask' },
] as const

export const genderStyleOptions = [
  { value: 'feminine', label: 'Feminine', emoji: '🌸' },
  { value: 'masculine', label: 'Masculine', emoji: '🧔' },
  { value: 'androgynous', label: 'Androgynous', emoji: '✦' },
  { value: 'no-preference', label: 'No preference', emoji: '✌️' },
] as const
