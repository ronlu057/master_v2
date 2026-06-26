// /_admin/ai-* 共用：Gemini 呼叫（金鑰讀取 + 模型備援 + 暫時性錯誤自動重試）
//
// 為什麼需要重試：Gemini 尖峰時會回「This model is currently experiencing high demand」
// （503 / UNAVAILABLE）這類**暫時性**錯誤。原本只「換模型」沒有「等一下再試」，
// 而過載通常是服務層級 → 連換幾個同系列模型會一起失敗。
// 這裡對暫時性錯誤做指數退避重試，並把候選模型延伸到跨代的 2.0-flash（不同容量池）。
import fs from 'node:fs'
import path from 'node:path'
import { readEnv } from './utils.js'

const API = 'https://generativelanguage.googleapis.com/v1beta/models'

// 讀 .env.local（私密、不納版控）→ 金鑰優先放這
function readEnvLocal() {
  const p = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return {}
  const out = {}
  fs.readFileSync(p, 'utf8')
    .split('\n')
    .forEach((line) => {
      const t = line.trim()
      if (!t || t.startsWith('#')) return
      const i = t.indexOf('=')
      if (i < 0) return
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
    })
  return out
}

// 取所有可用金鑰（支援多組備援）：
//   - NUXT_GEMINI_KEY / NUXT_GEMINI_KEY2 / NUXT_GEMINI_KEY3 / NUXT_GEMINI_KEY4 各一把
//   - 任一變數也可用逗號分隔多把
//   來源優先序：process.env → .env.local → .env；去重、保留順序。
//   配額用盡時 callGemini 會自動換下一把（額度是按金鑰 / 帳號算的）。
export function geminiKeys() {
  const local = readEnvLocal()
  const env = readEnv()
  const pick = (name) => process.env[name] || local[name] || env[name] || ''
  const out = []
  for (const name of ['NUXT_GEMINI_KEY', 'NUXT_GEMINI_KEY2', 'NUXT_GEMINI_KEY3', 'NUXT_GEMINI_KEY4']) {
    for (const part of pick(name).split(',')) {
      const k = part.trim()
      if (k && !out.includes(k)) out.push(k)
    }
  }
  return out
}

// 第一把金鑰（相容舊用法）
export function geminiKey() {
  return geminiKeys()[0] || ''
}

// 預設模型（可由 NUXT_GEMINI_MODEL 覆寫）
export function geminiModel() {
  const local = readEnvLocal()
  return (
    process.env.NUXT_GEMINI_MODEL || local.NUXT_GEMINI_MODEL || readEnv().NUXT_GEMINI_MODEL || 'gemini-2.5-flash'
  )
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 把錯誤分類：尖峰過載（值得重試）vs 配額/額度用盡（重試無益、快速跳過）
function classifyError(e) {
  const status = e?.status || e?.statusCode || e?.response?.status
  const msg = e?.data?.error?.message || e?.message || ''
  const low = msg.toLowerCase()
  // 配額 / 計費（429 RESOURCE_EXHAUSTED）：硬上限或分鐘級限流，當下重試也沒用
  const isQuota =
    status === 429 || /quota|exceeded your current quota|billing|resource has been exhausted/.test(low)
  // 尖峰過載 / 暫時性 5xx：等一下重試常可成功
  const isOverload =
    !isQuota &&
    (status === 500 || status === 502 || status === 503 ||
      /high demand|overload|unavailable|try again|temporar/.test(low))
  return { isQuota, isOverload, msg }
}

// 呼叫 Gemini generateContent：多金鑰 + 模型備援 + 「過載」指數退避重試。
//   - 過載（暫時性）→ 同金鑰同模型退避後重試，再換下一個模型。
//   - 配額用盡 → 不重試，直接換「下一把金鑰」（額度按金鑰算，換把就有額度）。
// args: { model?, contents, generationConfig }
// 成功回傳 API 原始 data；全部失敗丟 502/429（過載/配額給友善訊息）。
export async function callGemini({ model, contents, generationConfig }) {
  const keys = geminiKeys()
  if (!keys.length) {
    throw createError({
      statusCode: 400,
      message: '尚未設定 NUXT_GEMINI_KEY，請到 .env.local 填入 Gemini API 金鑰',
    })
  }
  // 候選模型：只留免費方案可用且支援 vision 的 2.5 系列（2.0-flash 免費額度為 0，不放）
  const candidates = [...new Set([model || geminiModel(), 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])]
  const backoff = [600, 1500, 3000] // 同一模型遇「過載」的退避等待（ms）
  let lastErr = null
  let sawQuota = false
  for (const key of keys) {
    let quotaThisKey = false // 這把金鑰配額用盡 → 跳出換下一把
    for (const m of candidates) {
      if (quotaThisKey) break
      for (let attempt = 0; attempt <= backoff.length; attempt++) {
        try {
          return await $fetch(`${API}/${m}:generateContent?key=${key}`, {
            method: 'POST',
            body: { contents, generationConfig },
          })
        } catch (e) {
          lastErr = e
          const { isQuota, isOverload } = classifyError(e)
          if (isQuota) {
            sawQuota = true
            quotaThisKey = true
            break // 配額用盡 → 不重試、不換模型，直接換下一把金鑰
          }
          if (isOverload && attempt < backoff.length) {
            await sleep(backoff[attempt]) // 過載 → 退避後同模型重試
            continue
          }
          break // 非暫時性 / 重試用盡 → 換下一個模型
        }
      }
    }
  }
  // 友善訊息：配額用盡 → 提示稍後再試（盡量帶出可再試秒數）；其餘照原訊息
  const raw = lastErr?.data?.error?.message || lastErr?.statusMessage || lastErr?.message || '未知錯誤'
  if (sawQuota) {
    const sec = /retry in ([\d.]+)s/i.exec(raw)?.[1]
    const wait = sec ? `約 ${Math.ceil(Number(sec))} 秒後再試` : '請稍後再試'
    throw createError({
      statusCode: 429,
      message: `Gemini 免費額度暫時用盡，${wait}（或在 .env.local 換一支有額度的 NUXT_GEMINI_KEY）`,
    })
  }
  throw createError({ statusCode: 502, message: `Gemini 呼叫失敗：${raw}` })
}

// 取回應的第一段文字（沒有就丟 502）
export function geminiText(data) {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) throw createError({ statusCode: 502, message: 'Gemini 沒有回傳內容' })
  return text
}
