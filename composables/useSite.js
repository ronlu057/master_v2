// ── 站台共用資料 ────────────────────────────────────────────
// 選單、公司資料、多語字典 — 以固定 key 快取，全站共用一份。

// 選單（/menu/view）— 已 flatten 成標準 children 樹
export function useSiteMenu() {
  return useApiData('/menu/view', {
    key: 'site:menu',
    default: () => ({ header: [], footer: [], mobile: [] }),
  })
}

// 公司資料（/firm/view）— 聯絡 / 社群 / 追蹤碼 / Footer
export function useSiteFirm() {
  return useApiData('/firm/view', {
    key: 'site:firm',
    default: () => ({ firm: {}, rules: [] }),
  })
}

// 多語字典（/i18n）+ t() 翻譯函式（查無 key 時 fallback 為 key 本身）
export function useDict() {
  const { data } = useApiData('/i18n', { key: 'site:i18n', default: () => ({}) })
  const t = (key) => (data.value && data.value[key]) || key
  return { dict: data, t }
}
