// 由每則 rows 的「標題 / 副標 / 說明文」自訂色，組出一段要注入 <style> 的 CSS。
//
// 設計（不用行內 :style，符合製作規範 §3.1.2）：
//   - color: 屬性仍寫在各 BlockBanner 的 SCSS（`color: var(--banner-*-color, 原色)`）。
//   - 每則文字容器掛上 `${prefix}-${i}` class（:class 綁定，允許），本函式產生對應規則
//     `.js-banner-row-0 { --banner-title-color: #f00; ... }` 注入 <head>，設定該則的變數值。
//   - 用「row-index class」而非 `:nth-child` → Swiper loop 複製出的 slide 會帶同一個 class，
//     顏色跟著對；nth-child 會因 clone 位移而錯亂。
//
// 變數 cascade 優先序：每則 class（離文字最近）> 全站後台色（app.vue 注入 :root）
// > 版型 SCSS 預設色（var() fallback）。沒設的欄位不輸出 → 自動交還上一層。
export function bannerRowColorCss(rows, prefix = 'js-banner-row') {
  return (rows || [])
    .map((r, i) => {
      const decls = []
      if (r?.titleColor) decls.push(`--banner-title-color: ${r.titleColor};`)
      if (r?.subtitleColor) decls.push(`--banner-subtitle-color: ${r.subtitleColor};`)
      if (r?.memoColor) decls.push(`--banner-memo-color: ${r.memoColor};`)
      return decls.length ? `.${prefix}-${i} { ${decls.join(' ')} }` : ''
    })
    .filter(Boolean)
    .join('\n')
}
