// 統一的社群連結 composable — 給各 Header navtool social block 用
//
// 從 firm.json 的 firm.social 取連結，過濾掉以下「空值」：
//   - null / undefined
//   - 空字串 ''
//   - 全空格字串 '   '
//
// 全部社群都沒值時回傳 []（Header template 用 socials.length 判斷整個 block 不渲染）
//
// 回傳格式：[{ key: 'facebook', url: 'https://...' }, ...]
//   key 對應 .icon-${key} 的 mask icon（assets/styles/icons.scss 內已定義
//   facebook/instagram/line/youtube/twitter）
export function useSocials() {
  const { data: firmData } = useSiteFirm()

  return computed(() => {
    const s = firmData.value?.firm?.social || {}
    return [
      { key: 'facebook', url: s.facebook },
      { key: 'instagram', url: s.instagram },
      { key: 'line', url: s.line },
      { key: 'youtube', url: s.youtube },
      { key: 'twitter', url: s.twitter },
    ].filter((x) => typeof x.url === 'string' && x.url.trim().length > 0)
  })
}
