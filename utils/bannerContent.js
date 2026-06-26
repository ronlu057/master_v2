// 首頁 Banner 內容「每個 BlockBanner 版型各自一份」的解析。
//
// banners.json 的 home 結構（新）：
//   home = {
//     news: [...],                 // 跑馬燈新聞，全版型共用
//     byLayout: {                  // 每個版型各自的內容
//       BlockBanner01: { rows: [...], videoUrl: '', videoFile: '' },
//       BlockBanner02: { ... },
//     }
//   }
//
// 舊結構（相容）：home = { rows, videoUrl, videoFile, news }（單一內容，全版型共用）。
// 規則：一旦有 byLayout → 各版型以自己那筆為準（沒有就是「空內容」，不會借用別人的）；
//      還沒有 byLayout（舊資料）→ 整包 rows/video 視為通用內容。
//
// 「沒有影片的版型」videoUrl/videoFile = '' → 前台自然不顯示影片。

// 解析「某版型」的內容 → 一律回傳 { rows, videoUrl, videoFile, news } 給版型元件用。
// fallbackFirst：找不到該版型時退回第一個版型（給「只是要一張 banner 當 hero」的客製首頁用；
//   BlockBanner 派發器則用 false，各版型嚴格獨立、缺就是空）。
export function resolveBannerContent(home, layout, { fallbackFirst = false } = {}) {
  home = home || {}
  const news = home.news || []
  let c
  if (home.byLayout && typeof home.byLayout === 'object') {
    c = home.byLayout[layout]
    if (!c && fallbackFirst) c = Object.values(home.byLayout)[0]
    c = c || {}
  } else {
    c = { rows: home.rows, videoUrl: home.videoUrl, videoFile: home.videoFile } // 舊資料：整包通用
  }
  return {
    rows: c.rows || [],
    videoUrl: c.videoUrl || '',
    videoFile: c.videoFile || '',
    news,
  }
}

// 把「某版型」的內容寫回整包 home（保留 news 與其他版型），回傳新的 home 物件。
// 同時清掉舊的頂層 rows/videoUrl/videoFile（已搬進 byLayout，避免兩份來源打架）。
export function setBannerContent(home, layout, content) {
  const src = home || {}
  const byLayout = { ...(src.byLayout || {}) }
  byLayout[layout] = {
    rows: content?.rows || [],
    videoUrl: content?.videoUrl || '',
    videoFile: content?.videoFile || '',
  }
  return { news: src.news || [], byLayout }
}
