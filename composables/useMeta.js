// ── SEO Meta ────────────────────────────────────────────────
// 把白皮書 /seo/* 回應的欄位套進 <head>。
export function applySeo(seo) {
  if (!seo) return
  useSeoMeta({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    ogTitle: seo.og?.title || seo.title,
    ogDescription: seo.og?.description || seo.description,
    ogImage: seo.og?.image,
  })
}
