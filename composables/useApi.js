// ── API 串接層 ──────────────────────────────────────────────
// 統一處理白皮書回應格式：{ status, data: { payload, meta } }
// apiBase 留空 → 打本地 mock JSON（server/routes/api）；填網域 → 打真實後端。

// 解開白皮書回應格式，取出 payload
function unwrap(res) {
  if (res && res.status === 'ok' && res.data) return res.data.payload
  return res
}

/**
 * SSR 資料獲取（包裝 useFetch）— 用於頁面 / 元件 setup 階段取資料。
 * @param {string} path  端點路徑，如 '/home/view'
 * @param {object} opts  useFetch 選項（query / key / default ...）
 */
export function useApiData(path, opts = {}) {
  const { public: pub } = useRuntimeConfig()
  const base = pub.apiBase || ''
  return useFetch(`${base}/api${path}`, {
    transform: unwrap,
    ...opts,
  })
}

/**
 * 命令式請求（包裝 $fetch）— 用於表單送出等 POST 互動。
 * @param {string} path  端點路徑
 * @param {object} opts  $fetch 選項（method / body ...）
 */
export async function $api(path, opts = {}) {
  const { public: pub } = useRuntimeConfig()
  const base = pub.apiBase || ''
  const res = await $fetch(`${base}/api${path}`, opts)
  return unwrap(res)
}
