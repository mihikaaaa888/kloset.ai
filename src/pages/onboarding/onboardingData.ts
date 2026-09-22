import type { StylePreference, Occasion } from '@/types'
export { COLOUR_PALETTE } from '@/lib/colourUtils'

export const styleOptions: {
  value: StylePreference
  label: string
  description: string
  imageUrl: string
  accent: string
}[] = [
  {
    value: 'minimalist',
    label: 'Minimal',
    description: 'Clean lines, neutral palette',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&auto=format&fit=crop',
    accent: '#E8E4DE',
  },
  {
    value: 'classic',
    label: 'Classic',
    description: 'Timeless, tailored, polished',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80&auto=format&fit=crop',
    accent: '#D4C9BE',
  },
  {
    value: 'romantic',
    label: 'Feminine',
    description: 'Soft, delicate, elegant',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80&auto=format&fit=crop',
    accent: '#F2D0D0',
  },
  {
    value: 'streetwear',
    label: 'Streetwear',
    description: 'Urban, casual, expressive',
    imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&q=80&auto=format&fit=crop',
    accent: '#C8C8C8',
  },
  {
    value: 'business',
    label: 'Old Money',
    description: 'Quiet luxury, understated',
    imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80&auto=format&fit=crop',
    accent: '#D4C49A',
  },
  {
    value: 'bohemian',
    label: 'Bohemian',
    description: 'Free-spirited, earthy, layered',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80&auto=format&fit=crop',
    accent: '#C9B89A',
  },
  {
    value: 'athleisure',
    label: 'Sporty',
    description: 'Active, comfortable, functional',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80&auto=format&fit=crop',
    accent: '#B8D4C8',
  },
  {
    value: 'eclectic',
    label: 'Experimental',
    description: 'Bold, mixed, creative',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80&auto=format&fit=crop',
    accent: '#C8B4D4',
  },
]

export const occasionOptions: { value: Occasion; label: string }[] = [
  { value: 'work', label: 'Work / Office' },
  { value: 'casual', label: 'Everyday Casual' },
  { value: 'formal', label: 'Formal Events' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'weekend', label: 'Weekend Outings' },
  { value: 'travel', label: 'Travel' },
  { value: 'gym', label: 'Gym / Active' },
  { value: 'special-event', label: 'Special Events' },
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
  { value: 'feminine', label: 'Feminine' },
  { value: 'masculine', label: 'Masculine' },
  { value: 'androgynous', label: 'Androgynous' },
  { value: 'no-preference', label: 'No preference' },
] as const
