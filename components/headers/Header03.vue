<script setup>
// 頁首版型 03 — 含 mega menu 產品總覽（Products Overview）
//   主結構：左 Logo + 右 navmenu + navtool（lang / cart / search / 漢堡）
//   特色：產品主選單 hover 時展開 mega menu，含 Series → Preview 雙層 hover 互動
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>
// ── 專案類型 / 通用狀態 ─────────────────────────────────────
const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

const socials = useSocials()

// ── i18n ─────────────────────────────────────────────────
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

// ── 搜尋表單 ─────────────────────────────────────────────
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

// ── Mega menu 產品資料 ────────────────────────────────────
// 從 /api/header/products 拉（mock：server/mock/data/header_products.json）
// 真實後端時，把 mock JSON 換成後端 endpoint 即可，URL 不變
const { data: headerProducts } = await useApiData('/header/products', {
  key: 'header-products',
  default: () => ({ series: [] }),
})

// hover 互動狀態：activeSeries = 當前 hover 的 series key、activePreview = 各 series 內當前 preview key
const activeSeries = ref('')
const activePreview = ref({}) // { [seriesKey]: previewKey }

// 預設第一筆為 active（避免初始空白）
watchEffect(() => {
  const list = headerProducts.value?.series || []
  if (list.length && !activeSeries.value) {
    activeSeries.value = list[0].key
  }
  for (const s of list) {
    if (!activePreview.value[s.key] && s.items?.length) {
      activePreview.value[s.key] = s.items[0].key
    }
  }
})

const onSeriesHover = (key) => { activeSeries.value = key }
const onPreviewHover = (seriesKey, previewKey) => {
  activePreview.value = { ...activePreview.value, [seriesKey]: previewKey }
}

// 判斷 menu item 是否要顯示 mega menu（demo：URL 含 /products 視為產品節點）
const isProductNode = (item) => item.url?.startsWith('/products')

// ── Mega menu 顯示控制（JS delay，避免 hover gap 造成誤關閉）
// 純 CSS hover 在 fixed mega menu 的情境下，滑鼠從 li 移到 mega menu 中間若有縫隙會觸發 mouseleave。
// 用 200ms delay 給使用者足夠時間移過去；若中途又 enter（li 或 mega menu），cancel 關閉計時器。
const megaOpen = ref(false)
let closeTimer = null
const openMega = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  megaOpen.value = true
}
const scheduleCloseMega = () => {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    megaOpen.value = false
    closeTimer = null
  }, 200)
}
onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})

// ── 捲動偵測（仿 Header01：捲過 banner 就加 .scroll） ───────
const headerEl = ref(null)
const isScrolled = ref(false)
const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  const banner = document.querySelector('[class^="banner"]')
  const bannerH = banner ? banner.offsetHeight : 0
  isScrolled.value = window.scrollY >= Math.max(0, bannerH - headerH)
}
onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <header ref="headerEl" :class="['header03', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" title="回首頁">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- 主選單（桌面） -->
      <nav v-if="!isMinimal" itemscope itemtype="https://www.schema.org/SiteNavigationElement">
        <ul class="navmenu">
          <li
            v-for="item in menuData.header"
            :key="item.url"
            itemprop="name"
            @mouseenter="isProductNode(item) && openMega()"
            @mouseleave="isProductNode(item) && scheduleCloseMega()"
          >
            <NuxtLink :to="item.url" itemprop="url">{{ item.title }}</NuxtLink>

            <!-- 一般 children 下拉 -->
            <div
              v-if="item.children?.length && !isProductNode(item)"
              class="navmenu_sub"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.url"
                :to="child.url"
                itemprop="url"
              >
                {{ child.title }}
              </NuxtLink>
            </div>

            <!-- 產品節點：展開 mega menu（JS 控制，hover li 或 mega menu 自身都保持開啟） -->
            <div
              v-if="isProductNode(item) && headerProducts.series?.length"
              :class="['sp_dropdown', { open: megaOpen }]"
              @mouseenter="openMega"
              @mouseleave="scheduleCloseMega"
            >
              <div class="sp_inner">
                <div class="left">
                  <div class="overview_title">Products Overview</div>
                  <a
                    v-for="s in headerProducts.series"
                    :key="s.key"
                    href="javascript:;"
                    :class="{ active: activeSeries === s.key }"
                    @mouseenter="onSeriesHover(s.key)"
                  >
                    <span>{{ s.title }}</span>
                    <span class="arrow">›</span>
                  </a>
                </div>

                <div class="right">
                  <div
                    v-for="s in headerProducts.series"
                    :key="s.key"
                    :class="{ active: activeSeries === s.key }"
                    class="series_panel"
                  >
                    <div class="series">
                      <a
                        v-for="p in s.items"
                        :key="p.key"
                        href="javascript:;"
                        :class="{ active: activePreview[s.key] === p.key }"
                        @mouseenter="onPreviewHover(s.key, p.key)"
                      >
                        {{ p.title }}
                      </a>
                    </div>

                    <div class="quick_view">
                      <div
                        v-for="p in s.items"
                        :key="p.key"
                        :class="{ active: activePreview[s.key] === p.key }"
                        class="quick_card"
                      >
                        <div class="quick_pic">
                          <img :src="p.image" :alt="p.title" />
                        </div>
                        <div class="quick_info">
                          <div class="quick_title">{{ p.title }}</div>
                          <p>{{ p.resume }}</p>
                          <NuxtLink :to="p.url" class="quick_btn">
                            <span>VIEW MORE</span>
                          </NuxtLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <!-- 工具列（順序 / 顯示由 useNavtoolConfig 控制） -->
      <div v-if="!isMinimal" class="navtool">
        <!-- 搜尋 -->
        <div
          v-if="navtool.isEnabled('search')"
          class="search_btn"
          :style="{ order: navtool.orderOf('search') }"
        >
          <i class="icon icon-search"></i>
          <form @submit.prevent="onSearch">
            <div class="search_box">
              <input
                v-model="keyword"
                type="text"
                autocomplete="off"
                placeholder="網站搜尋..."
                aria-label="網站搜尋"
              />
              <button type="submit" aria-label="搜尋"><i class="icon icon-search" aria-hidden="true"></i></button>
            </div>
          </form>
        </div>

        <!-- 語系 -->
        <div
          v-if="navtool.isEnabled('language') && languages.length > 1"
          class="lang_toggle"
          :style="{ order: navtool.orderOf('language') }"
        >
          <i class="icon icon-language"></i> <span>Language</span>
          <ul>
            <li v-for="lang in languages" :key="lang.code">
              <button
                type="button"
                :class="{ active: lang.code === locale }"
                @click="setLocale(lang.code)"
              >
                {{ lang.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- 社群 -->
        <div
          v-if="navtool.isEnabled('social') && socials.length"
          class="navtool_social"
          :style="{ order: navtool.orderOf('social') }"
        >
          <a
            v-for="s in socials"
            :key="s.key"
            :href="s.url"
            :aria-label="s.key"
            target="_blank"
            rel="noopener"
          >
            <i :class="['icon', `icon-${s.key}`]"></i>
          </a>
        </div>

        <!-- 會員中心 -->
        <NuxtLink
          v-if="navtool.isEnabled('member')"
          class="member_btn"
          to="/member"
          :style="{ order: navtool.orderOf('member') }"
          aria-label="會員中心"
        >
          <i class="icon icon-member"></i>
        </NuxtLink>

        <!-- 購物車 -->
        <NuxtLink
          v-if="navtool.isEnabled('cart')"
          class="cart_btn"
          to="/shop/cart"
          :style="{ order: navtool.orderOf('cart') }"
          aria-label="購物車"
        >
          <i class="icon icon-shopcart"></i>
          <p v-if="cart.count">{{ cart.count }}</p>
        </NuxtLink>

        <!-- 我的最愛 -->
        <NuxtLink
          v-if="navtool.isEnabled('favorite')"
          class="favorite_btn"
          to="/shop/favorite"
          :style="{ order: navtool.orderOf('favorite') }"
          aria-label="我的最愛"
        >
          <i class="icon icon-like"></i>
        </NuxtLink>

        <!-- 行動版漢堡 -->
        <button
          v-if="!isMinimal"
          class="mbPanel_btn"
          :class="{ active: ui.menuOpen }"
          aria-label="開啟選單"
          @click="ui.toggleMenu"
        >
          <span class="bars">
            <span class="bar bar1"></span>
            <span class="bar bar2"></span>
            <span class="bar bar3"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- 行動版下拉選單 -->
    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="mb_panel">
        <div class="mb_navmenu">
          <div v-for="item in menuData.mobile" :key="item.url" class="mb_navmenu_item">
            <NuxtLink :to="item.url" class="mb_navmenu_link" @click="ui.closeMenu">
              {{ item.title }}
            </NuxtLink>
            <div v-if="item.children?.length" class="mb_navmenu_sub">
              <NuxtLink
                v-for="child in item.children"
                :key="child.url"
                :to="child.url"
                @click="ui.closeMenu"
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.header03 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  background: $web_header_2;
  z-index: $z_header;
  transition: all 0.3s;

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
  }

  .logo {
    display: flex;
    align-items: center;
    position: relative;
    height: fluid(70);
    padding: 0 5.2083vw 0 4.1667vw;
    background: #fff;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 60px 70px 0;
      border-color: transparent $web_header_2 transparent transparent;
    }

    img {
      max-height: fluid(60);
    }
  }
}

.navbar {
  display: flex;
  padding-right: 4.1667vw;
}

.navmenu {
  display: flex;
  align-items: stretch;
  list-style: none;
  margin: 0;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    position: relative;
    display: flex;
    align-items: center;
    min-height: fluid(70);     // 撐滿 header 高度，讓 li hover 範圍延伸到 sp_dropdown 頂邊（消除 gap）

    > a {
      display: flex;
      align-items: center;
      height: 100%;        // a 也撐滿，確保整個 li 視覺都是 hover 區
      color: #fff;
      font-size: 16px;
      padding: fluid(10) fluid(20);
      background-image: linear-gradient(to right, $web_header_1, $web_header_1);
      background-size: 0 1px;
      background-position: center calc(100% - 5px);
      background-repeat: no-repeat;
      transition: all 0.3s;

      @include rwd-1280 { padding: 10px 13px; }
    }

    &:hover,
    > a.router-link-active {
      > a {
        color: #e70000;
        background-size: 75% 1px;
      }
    }

    // navmenu_sub：水平置中 popup，hover 時 Y 滑入（純 CSS hover 即可）
    &:hover > .navmenu_sub {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0);
    }
    // sp_dropdown 改用 .open class 由 JS 控制（避免 fixed 元素 hover gap 問題）
  }
}

// 一般 children 下拉（沿用 Header02 風格：白底 + 主色字 hover）
.navmenu_sub {
  position: absolute;
  top: 100%;
  left: 50%;
  min-width: fluid(160);
  padding: fluid(6);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(-50%) translateY(8px);
  transition: all var(--transition);
  z-index: 60;

  a {
    display: block;
    color: $web_font_color;
    font-size: 14px;
    padding: fluid(8) fluid(12);
    border-radius: fluid(6);
    transition: all 0.3s;

    &:hover,
    &.router-link-active {
      background: var(--color-surface);
      color: $web_header_1;
    }
  }
}

// 產品 mega menu — fixed 全寬，由 JS .open class 控制開關（含 200ms delay 防誤關）
.sp_dropdown {
  position: fixed;
  top: fluid(70);
  left: 0;
  width: 100vw;
  padding: fluid(60) 0 fluid(25);
  background: #f8f8f8;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(8px);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;

  &.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }
}

.sp_inner {
  display: flex;
  max-width: fluid(1420);
  padding: 0 fluid(60);
  margin: 0 auto;
}

.left {
  width: calc(320 / 1300 * 100%);
}

.overview_title {
  color: $web_header_1;
  font-size: fluid(32);
  font-weight: 700;
  padding-bottom: fluid(22);
  border-bottom: 1px solid $web_header_1;
  margin-bottom: fluid(10);

  @include rwd-1440 { font-size: 28px; }
}

.left > a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: fluid(12) 0;
  border-bottom: 1px solid #c5c5c5;
  cursor: pointer;
  transition: all 0.3s;

  > span:first-child {
    color: $web_font_color;
    font-size: fluid(20);
    font-weight: 700;
    padding-right: fluid(30);
    transition: all 0.3s;

    @include rwd-1440 { font-size: 18px; }
    @include rwd-1280 { font-size: 16px; }
  }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fluid(30);
    height: fluid(30);
    background: #fff;
    border-radius: 50%;
    color: $web_header_1;
    font-size: 18px;
    transition: all 0.3s;
  }

  &:hover,
  &.active {
    border-bottom-color: $web_header_1;

    > span:first-child { color: $web_header_1; }

    .arrow {
      background: $web_header_1;
      color: #fff;
    }
  }
}

.right {
  width: calc(980 / 1300 * 100%);
  padding-left: fluid(75);
}

.series_panel {
  display: none;

  &.active { display: flex; }
}

.series {
  width: calc(300 / 915 * 100%);
  padding-right: fluid(30);

  a {
    display: flex;
    align-items: center;
    color: $web_font_color;
    margin-bottom: fluid(10);
    cursor: pointer;
    transition: all 0.3s;

    &::before {
      content: '';
      width: 0;
      height: 2px;
      background: $web_header_1;
      transition: all 0.3s;
    }

    &:hover,
    &.active {
      color: $web_header_1;

      &::before {
        width: fluid(10);
        margin-right: fluid(10);
      }
    }
  }
}

.quick_view {
  width: calc(615 / 915 * 100%);
  padding: fluid(15) fluid(25) fluid(30);
  background: #fff;
  border-radius: fluid(20);
  box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.1);

  .quick_card {
    display: none;

    &.active { display: flex; }
  }
}

.quick_pic {
  width: fluid(175);

  img {
    width: 100%;
    display: block;
  }
}

.quick_info {
  width: calc(100% - 175px);
  padding-left: fluid(35);

  @include rwd-1440 { padding-left: 30px; }
}

.quick_title {
  color: $web_header_1;
  font-weight: 700;
  margin-bottom: fluid(10);
}

.quick_btn {
  display: inline-block;
  margin-top: fluid(20);
  padding: fluid(8) fluid(24);
  border: 1px solid $web_header_1;
  color: $web_header_1;
  font-size: 13px;
  letter-spacing: 2px;
  transition: all 0.3s;

  &:hover {
    background: $web_header_1;
    color: #fff;
  }
}

// 工具列
.navtool {
  display: flex;
  margin-left: fluid(20);
  gap: fluid(26);

  > div,
  > a {
    display: flex;
    align-items: center;
    position: relative;
    color: #fff;
    font-size: 16px;
    padding: fluid(10) 0;
    background-image: linear-gradient(to right, $web_header_1, $web_header_1);
    background-size: 0 1px;
    background-position: center calc(100% - 5px);
    background-repeat: no-repeat;
    cursor: pointer;
    transition: all 0.3s;

    & + & { margin-left: 20px; }

    @include rwd-1200 {
      background-image: none;

      &:not(.cart_btn):not(.mbPanel_btn) { display: none; }
    }

    color: #fff;

    .icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    &:hover {
      color: #9a9a9a;
      background-size: 100% 1px;
      transition: all 0.3s;

      ul,
      form {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
    }
  }
}

.lang_toggle {
  span { margin-left: 6px; }

  // hover 時把下拉 translate 歸位（滑入動畫）
  &:hover ul {
    transform: translateX(-50%) translateY(0);
  }

  // 下拉樣式對齊 navmenu_sub（白底 + 主色字 hover）
  ul {
    position: absolute;
    top: 100%;
    left: 50%;
    min-width: fluid(160);
    padding: fluid(6);
    list-style: none;
    margin: 0;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(-50%) translateY(8px);
    transition: all var(--transition);
    z-index: 60;

    li button {
      display: block;
      width: 100%;
      color: $web_font_color;
      font-size: 14px;
      padding: fluid(8) fluid(12);
      background: none;
      border: none;
      border-radius: fluid(6);
      cursor: pointer;
      text-align: left;
      transition: all 0.3s;

      &:hover,
      &.active {
        background: var(--color-surface);
        color: $web_header_1;
      }
    }
  }
}

.cart_btn {
  position: relative;

  p {
    position: absolute;
    top: -2px;
    right: fluid(-10);
    min-width: fluid(18);
    height: fluid(18);
    padding: 0 fluid(4);
    border-radius: fluid(99);
    background: $web_header_1;
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// search 下拉樣式對齊 navmenu_sub（白底 + 主色字 hover）
.search_btn {
  // hover 時把下拉 translate 歸位（滑入動畫）
  &:hover form {
    transform: translateY(0);
  }

  form {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: fluid(280);
    padding: fluid(10);
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(8px);
    transition: all var(--transition);
    z-index: 60;
  }

  .search_box {
    display: flex;
    align-items: center;
    gap: fluid(6);

    input {
      flex: 1;
      padding: fluid(8) fluid(12);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: #fff;
      color: $web_font_color;
      font-size: 14px;

      &::placeholder { color: var(--color-text-muted); }
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: fluid(4);
      flex-shrink: 0;
      border-radius: fluid(6);
      color: $web_font_color;
      transition: background 0.3s, color 0.3s;

      .icon { font-size: 18px; }

      &:hover {
        background: var(--color-surface);
        color: $web_header_1;
      }
    }
  }
}

.mbPanel_btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;

  @include rwd-1200 { display: flex; }
  @media (min-width: 1201px) { display: none !important; }

  .bars {
    position: relative;
    width: fluid(30);
    height: 2px;

    .bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: fluid(10);

      &.bar1 {
        top: fluid(-8);
        transition: top 0.3s 0.5s, transform 0.3s;
      }
      &.bar2 { transition: opacity 0s 0.3s; }
      &.bar3 {
        top: fluid(8);
        transition: top 0.3s 0.5s, transform 0.3s;
      }
    }
  }

  &.active .bars .bar {
    &.bar1 { top: 0; transform: rotate(45deg); transition: top 0.3s, transform 0.3s 0.5s; }
    &.bar2 { opacity: 0; }
    &.bar3 { top: 0; transform: rotate(-45deg); transition: top 0.3s, transform 0.3s 0.5s; }
  }
}

// 行動版下拉選單
.mb_panel {
  position: fixed;
  top: fluid(70);
  left: 0;
  right: 0;
  background: $web_header_2;
  padding: fluid(8) fluid(20) fluid(16);
  z-index: $z_mobile_menu;
}

.mb_navmenu_link {
  display: block;
  padding: fluid(12) fluid(4);
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.mb_navmenu_sub {
  padding: 0 0 0 fluid(16);

  a {
    display: block;
    padding: fluid(8) fluid(4);
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
