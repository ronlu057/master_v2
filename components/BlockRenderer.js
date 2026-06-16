// Block 渲染器（render function 版；白皮書 §8.2）
//
// 維護 block.type → 元件 對照表，依序 render；未知 type 直接 skip。
// （Nuxt 自動引入無法用 resolveComponent('字串')，Block 一律在此手動 import 後放入對照表。）
//
// 為什麼用 render function 而非 template 的 v-for/v-if：
//   v-for / v-if 會被編譯成 Vue Fragment vnode，SSR 時每個 Fragment 都會吐出
//   `<!--[-->` / `<!--]-->` 邊界錨點、v-if 不成立則吐 `<!---->`。改成「在 wrapper
//   element 底下直接掛 children 陣列」就沒有 Fragment，SSR 照常輸出（SEO 不受影響），
//   但 dispatch 層不再產生那些 fragment 註解。
//   ⚠️ 這是 §2.1「元件一律 <script setup>」的刻意例外：純 render 的 dispatch 元件，
//      用 .js functional component 才能避開 Fragment 註解。
import { h } from 'vue'
import BlockBanner from './BlockBanner.vue'
import BlockIntro from './BlockIntro.vue'
import BlockNews from './BlockNews.vue'
import BlockGeneric from './BlockGeneric.vue'

const BLOCK_COMPONENTS = {
  banner: BlockBanner,
  intro: BlockIntro,
  news: BlockNews,
  push: BlockGeneric,
  other_ad: BlockGeneric,
}

export default function BlockRenderer(props) {
  const children = (props.blocks || [])
    .map((block, i) => {
      const Comp = BLOCK_COMPONENTS[block.type]
      if (!Comp) return null
      return h(Comp, { key: i, title: block.title, ...(block.item || {}) })
    })
    .filter(Boolean)

  // 單一 wrapper element + children 陣列 → 無 Fragment、無 fragment 註解
  return h('div', { class: props.wrapClass || null }, children)
}

BlockRenderer.props = ['blocks', 'wrapClass']
