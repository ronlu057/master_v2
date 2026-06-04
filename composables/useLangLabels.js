// 語系顯示文字 — 後台（/admin/header）可逐語系覆寫顯示字，留空 → 用呼叫端傳入的預設。
// 全站各 header 的語系切換都改用本 composable；預設文字由各 header 自帶：
//   - Header04：縮寫（TW/EN/JP/KR）
//   - 其餘 header：語系全名（l.name，來自 nuxt.config 的 i18n.locales）
//
// 用法：
//   const languages = useLangLabels((l) => l.name)
//   const languages = useLangLabels((l) => ABBR[l.code] || l.code.toUpperCase())
//
// 回傳 computed<[{ code, label }]>，shape 與原本一致，template 不需改。
// 覆寫值來源走 useEffectiveSettings().state.langLabels（支援 admin localStorage 即時預覽）。
export function useLangLabels(defaultLabel) {
  const { locales } = useI18n()
  const { state } = useEffectiveSettings()
  return computed(() =>
    locales.value.map((l) => {
      const custom = String(state.langLabels?.[l.code] ?? '').trim()
      return { code: l.code, label: custom || defaultLabel(l) }
    }),
  )
}
