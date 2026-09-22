export default function handler(req, res) {
  res.json({
    ok: true,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    timestamp: new Date().toISOString(),
  })
}
