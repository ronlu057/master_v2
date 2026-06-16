// ============================================================
// Mock API 派發器 — 模擬「一般網站白皮書」的後端 endpoint
// 對應 /api/* 路由；回應遵循白皮書 §2.1 統一格式。
// 正式串接時把 NUXT_PUBLIC_API_BASE 指向真實後端，本檔即不再被呼叫。
// ============================================================
import db from '../../mock/db.js'

// 白皮書 §2.1：成功格式 { status, data: { payload, meta } }
const ok = (payload, meta = {}) => ({
  status: 'ok',
  data: { payload, meta: { lang: 'tw', time: '0.003s', ...meta } },
})
// 白皮書 §2.1：失敗格式
const fail = (code, message, details = {}) => ({ status: 'error', code, message, details })

const toInt = (v, d) => {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? d : n
}

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'slug') || ''
  const q = getQuery(event)
  const route = `${event.method} /${path}`

  switch (route) {
    // ── 首頁聚合 ──────────────────────────────────────────
    case 'GET /home/view':
      return ok(db.home)
    case 'GET /home/cipage':
      return ok({ blocks: db.home.slots.find((s) => s.key === 'cipage')?.blocks || [] })
    case 'GET /home/homePush':
      return ok({ blocks: db.home.slots.find((s) => s.key === 'homePush')?.blocks || [] })
    case 'GET /home/homeOtherAd':
      return ok({ blocks: db.home.slots.find((s) => s.key === 'homeOtherAd')?.blocks || [] })

    // ── 選單 / 公司 / 多語 ────────────────────────────────
    // 選單依語系切換：?lang=tw|en|jp|kr；找不到 fallback 到 tw
    case 'GET /menu/view': {
      const lang = q.lang || 'tw'
      const menu = db.menu[lang] || db.menu.tw
      return ok(menu)
    }
    case 'GET /menu/header': {
      const lang = q.lang || 'tw'
      const menu = db.menu[lang] || db.menu.tw
      return ok({ header: menu.header })
    }
    case 'GET /header/products':
      return ok(db.headerProducts)
    case 'GET /firm/view':
      return ok(db.firm)
    case 'GET /i18n':
      return ok(db.i18n)

    // ── Banner ────────────────────────────────────────────
    // /banner/home 回傳整包首頁 banner（rows + 背景影片 + 跑馬燈新聞）；前台 BlockBanner 直接取此 API
    case 'GET /banner/home':
      return ok(db.banners.home, { mode: 'home', total: db.banners.home?.rows?.length || 0 })
    case 'GET /banner/page': {
      const list = db.banners.page[q.page] || db.banners.common
      return ok(list, { page: q.page || '', mode: db.banners.page[q.page] ? 'page' : 'common', total: list.length })
    }

    // ── SEO ───────────────────────────────────────────────
    case 'GET /seo/home':
      return ok(db.seo.home)
    case 'GET /seo/list': {
      const page = db.seo.pages[q.page_type]
      if (page) return ok(page)
      return ok({ ...db.seo.common, source: 'common', fallback_reason: 'page_not_found' })
    }

    // ── 新聞 ──────────────────────────────────────────────
    case 'GET /news/category':
      return ok(db.news.categories)
    case 'GET /news/list': {
      let items = db.news.items.slice()
      if (q.category) items = items.filter((n) => n.category_blinks.includes(q.category))
      if (q.q) items = items.filter((n) => n.title.includes(q.q))
      if (q.order === 'oldest') items.reverse()
      const page = toInt(q.page, 1)
      const limit = toInt(q.limit, 10)
      const total = items.length
      const paged = items.slice((page - 1) * limit, page * limit)
      return ok({
        items: paged,
        meta: { mode: 'paginated', page, limit, total },
      })
    }
    case 'GET /news/detail': {
      const item = db.news.items.find((n) => n.blink === q.url || String(n.id) === String(q.url))
      if (!item) {
        setResponseStatus(event, 404)
        return fail('NOT_FOUND', '找不到該文章')
      }
      return ok({ ...item, ...db.news.detailExtra })
    }
    case 'POST /news/view':
      return ok({ success: true })

    // ── 關於 / 內容頁 ─────────────────────────────────────
    case 'GET /about/detail': {
      const pageData = db.about[q.url]
      if (!pageData) {
        setResponseStatus(event, 404)
        return fail('NOT_FOUND', '找不到該頁面')
      }
      return ok(pageData)
    }
    case 'POST /about/view':
      return ok({ success: true })

    // ── 聯絡表單 ──────────────────────────────────────────
    case 'GET /contact/subjects':
      return ok(db.contact.subjects)
    case 'GET /contact/csrf':
      return ok({ csrf_name: 'csrf_token', csrf_value: `mock-${Date.now()}` })
    case 'POST /contact/submit':
      return ok({ success: true })
    case 'POST /contact/subscribe':
      return ok({ success: true })
    case 'POST /contact/unsubscribe':
    case 'GET /contact/unsubscribe':
      return ok({ success: true })

    // ── 全站搜尋 ──────────────────────────────────────────
    case 'GET /search': {
      const kw = (q.keyword || '').toString()
      const list = kw ? db.search.list.filter((r) => r.title.includes(kw) || r.summary.includes(kw)) : db.search.list
      return ok({ keyword: kw, categories: db.search.categories, list })
    }

    // ── FAQ（白皮書 §12.1）────────────────────────────────
    case 'GET /faq/category':
      return ok(db.faq.categories)
    case 'GET /faq/list': {
      let items = db.faq.items.slice()
      if (q.category) items = items.filter((f) => f.category === q.category)
      return ok({ items, meta: { total: items.length } })
    }
    case 'GET /faq/detail': {
      const f = db.faq.items.find((i) => String(i.id) === String(q.id))
      return f ? ok(f) : fail('NOT_FOUND', '找不到 FAQ')
    }

    // ── 下載中心（白皮書 §12.2）───────────────────────────
    case 'GET /download/category':
      return ok(db.download.categories)
    case 'GET /download/list': {
      let items = db.download.items.slice()
      if (q.category) items = items.filter((d) => d.category === q.category)
      return ok({ items })
    }

    // ── 服務據點（白皮書 §12.3）───────────────────────────
    case 'GET /location/category':
      return ok(db.location.categories)
    case 'GET /location/list': {
      let items = db.location.items.slice()
      if (q.category) items = items.filter((l) => l.category === q.category)
      if (q.q) items = items.filter((l) => l.title.includes(q.q) || l.address.includes(q.q) || l.tel.includes(q.q))
      return ok({ items })
    }

    // ── 彈跳廣告（白皮書 §12.4）───────────────────────────
    case 'GET /popupsAd/list':
      return ok(db.popupsAd)

    // ── 購物模組（購物類型專用 mock；對應購物系統白皮書）──
    case 'GET /shop/products': {
      let items = db.products.slice()
      if (q.category) items = items.filter((p) => p.category === q.category)
      return ok({ items, meta: { total: items.length } })
    }
    case 'GET /shop/product': {
      const p = db.products.find((x) => x.blink === q.blink || String(x.id) === String(q.blink))
      return p ? ok(p) : fail('NOT_FOUND', '找不到商品')
    }

    default:
      setResponseStatus(event, 404)
      return fail('NOT_FOUND', `mock endpoint 不存在：${route}`)
  }
})
