// Exa happily returns category/listing pages ("Women's White Sneakers",
// zara.com/.../woman-tops-blue-l5238.html) alongside real product pages, and
// a listing link is useless as a recommendation — the user lands on a grid,
// not the piece. Each retailer marks a single product differently in its
// URL path, so this is an allowlist per domain: anything that doesn't match
// its retailer's product shape is treated as a listing and dropped.
// Shared by server/index.mjs (local dev) and api/web-shop-search.js (Vercel).
const PRODUCT_PATH_PATTERNS = {
  'zara.com': /-p\d{6,}\.html$/i,                   // /us/en/flowy-wide-leg-pants-p09929249.html (listings end -l1360.html)
  'hm.com': /productpage\.\d+|\/buy-/i,             // /en_us/productpage.1090271001.html, ae.hm.com/en/buy-...
  'cos.com': /\/product\/|\/buy-/i,                 // /en-us/women/.../product/..., kw.cos.com/en/buy-...
  'stories.com': /\/product[/.]/i,                  // /en-us/product/..., /en_gbp/clothing/tops/product.<name>.html
  'everlane.com': /\/products\//i,                  // /products/womens-day-sneaker-white
  'uniqlo.com': /\/products?\//i,                   // /us/en/products/E442737-000/00, /be/en/product/...html
  'mango.com': /\/p\//i,                            // shop.mango.com/us/en/p/women/... (listings use /c/)
}

export function isProductPage(url) {
  let u
  try {
    u = new URL(url)
  } catch {
    return false
  }
  const host = u.hostname.replace(/^www\d*\./, '')
  for (const [domain, pattern] of Object.entries(PRODUCT_PATH_PATTERNS)) {
    if (host === domain || host.endsWith(`.${domain}`)) return pattern.test(u.pathname)
  }
  return false
}
