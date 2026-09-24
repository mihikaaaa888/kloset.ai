/**
 * Netlify Function that serves every /api/* route by running the same Express
 * app as local dev (server/app.mjs). netlify.toml rewrites /api/* here.
 */

import serverless from 'serverless-http'
import { app } from '../../server/app.mjs'

const expressHandler = serverless(app)

export const handler = async (event, context) => {
  // A rewrite normally passes the original /api/... path through, but a direct
  // hit on /.netlify/functions/api/... would miss every Express route — map it back.
  if (event.path?.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api')
  }

  const started = Date.now()
  try {
    const res = await expressHandler(event, context)
    console.log(`[netlify-api] ${event.httpMethod} ${event.path} → ${res.statusCode} in ${Date.now() - started}ms`)
    return res
  } catch (e) {
    console.error(`[netlify-api] ${event.httpMethod} ${event.path} crashed:`, e?.message ?? e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error. Please try again.' }),
    }
  }
}
