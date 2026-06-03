// SSR 階段每次 plugin run（每個 request）都讀 data/site-settings.json
// 把最新值套到 useEffectiveSettings state 上
// 這樣 admin 寫回 JSON 後，下一次站台 SSR 立即用新值，**不需要重啟 dev**
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'data', 'site-settings.json')

export default defineNuxtPlugin(() => {
  if (!existsSync(FILE)) return
  try {
    const settings = JSON.parse(readFileSync(FILE, 'utf8'))
    const { state } = useEffectiveSettings()
    for (const k of Object.keys(settings)) {
      if (k in state && settings[k] !== undefined) state[k] = settings[k]
    }
  } catch (e) {
    console.warn('[site-settings.server] read failed:', e.message)
  }
})
