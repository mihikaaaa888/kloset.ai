export interface ClothingAnalysis {
  name: string | null
  category: string | null
  subcategory: string | null
  primaryColor: string | null
  secondaryColors: string[]
  material: string | null
  pattern: string | null
  fit: string | null
  formality: string | null
  seasons: string[]
  occasions: string[]
  confidence: Record<string, number>
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix ("data:image/jpeg;base64,")
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function analyzeImage(blob: Blob): Promise<ClothingAnalysis | null> {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const mediaType = supportedTypes.includes(blob.type) ? blob.type : 'image/jpeg'

  const imageData = await blobToBase64(blob)

  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mediaType }),
  })

  if (!res.ok) return null

  const data = await res.json()
  return (data.analysis as ClothingAnalysis) ?? null
}

/**
 * Same analysis, but for an image the browser can display (via <img>) but
 * can't read the bytes of client-side — a pasted URL or a Pexels search
 * result. The server fetches it directly, sidestepping the CORS
 * restriction that blocks a client-side fetch() of most third-party images.
 */
export async function analyzeImageFromUrl(url: string): Promise<ClothingAnalysis | null> {
  const res = await fetch('/api/analyze-image-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) return null

  const data = await res.json()
  return (data.analysis as ClothingAnalysis) ?? null
}
