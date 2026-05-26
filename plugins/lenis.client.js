// ── Lenis 全站平滑捲動 + GSAP / ScrollTrigger 整合 ─────────────
// 接管 wheel / touch 捲動，加入慣性 + 緩動，讓頁面捲動更柔順。
// 僅 client 端載入（檔名 .client.js）— SSR 階段不執行（避免 window 不存在）。
//
// 整合要點：
//   1. 用 gsap.ticker 驅動 Lenis（取代 requestAnimationFrame），確保 GSAP 動畫與 Lenis 同步
//   2. lenis.on('scroll', ScrollTrigger.update) → ScrollTrigger 即時跟著 Lenis 捲動位置更新
//   3. gsap.ticker.lagSmoothing(0) → 關掉 lag 平滑，避免 ScrollTrigger 在頁面 throttle 時計算錯誤
//   4. MutationObserver 監聽 body class → 第三方套件（lightgallery / magnific-popup 等）
//      開啟 modal 時會加上特定 class，這時自動 lenis.stop() 鎖背景捲動
//
// 注意：Lenis 仍會觸發 window 'scroll' 事件，
//      所以 Header01.vue 等元件內的 scroll 監聽不需修改即可正常工作。
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 第三方套件開啟 modal 時會加在 <body> 上的 class（觸發 Lenis 暫停）
const LOCK_BODY_CLASSES = ['overflow', 'popwinOverflow', 'loadingOverflow', 'lg-on']

export default defineNuxtPlugin((nuxtApp) => {
  // 註冊 GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  // 建立 Lenis 實例
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // syncTouch 預設 false：行動裝置走系統原生捲動慣性，避免雙重平滑感
  })

  // Lenis 觸發捲動 → 通知 ScrollTrigger 即時重算
  lenis.on('scroll', ScrollTrigger.update)

  // 用 GSAP ticker 驅動 Lenis 更新（time 是秒，Lenis.raf 需要 ms → *1000）
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // 關掉 GSAP lag 平滑，避免 ScrollTrigger 在頁面 throttle 時計算錯誤
  gsap.ticker.lagSmoothing(0)

  // 監聽 body class 變化：當有套件加上鎖捲動 class 時，自動暫停 Lenis
  const observer = new MutationObserver(() => {
    const locked = LOCK_BODY_CLASSES.some((cls) => document.body.classList.contains(cls))
    if (locked) lenis.stop()
    else lenis.start()
  })
  observer.observe(document.body, { attributeFilter: ['class'] })

  // 路由切換時立即捲回頂部（不用 smooth，避免新頁面剛載入時還在「滑」）
  const router = useRouter()
  router.afterEach(() => {
    lenis.scrollTo(0, { immediate: true })
  })

  // 把 lenis / gsap instance provide 出去
  // 用法：const { $lenis, $gsap } = useNuxtApp()
  return {
    provide: {
      lenis,
      gsap,
      ScrollTrigger,
    },
  }
})
