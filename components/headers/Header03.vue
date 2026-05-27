<script setup>
// 頁首版型 03 — 含 mega menu 產品總覽（Products Overview）
//   主結構：左 Logo + 右 navmenu + navtool（lang / cart / search / 漢堡）
//   特色：產品主選單 hover 時展開 mega menu，含 Series → Preview 雙層 hover 互動
import SearchIcon from '~/assets/icon/search_icon.svg?component'
import LanguageIcon from '~/assets/icon/language_icon.svg?component'
import ShopcartIcon from '~/assets/icon/shopcart_icon.svg?component'

// ── 專案類型 / 通用狀態 ─────────────────────────────────────
const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()

// ── i18n ─────────────────────────────────────────────────
const { locale, locales, setLocale } = useI18n()
const languages = computed(() =>
  locales.value.map((l) => ({ code: l.code, label: l.name })),
)

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
      <img src="/img/logo/logo-AD.svg" alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- 主選單（桌面） -->
      <nav v-if="!isMinimal" itemscope itemtype="https://www.schema.org/SiteNavigationElement">
        <ul class="navmenu">
          <li v-for="item in menuData.header" :key="item.url" itemprop="name">
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

            <!-- 產品節點：展開 mega menu -->
            <div v-if="isProductNode(item) && headerProducts.series?.length" class="sp_dropdown">
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

      <!-- 工具列 -->
      <div class="navtool">
        <!-- 語系 -->
        <div v-if="languages.length > 1" class="lang_toggle">
          <LanguageIcon /> <span>Language</span>
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

        <!-- 購物車 -->
        <NuxtLink v-if="enableShop" class="cart_btn" to="/shop/cart" aria-label="購物車">
          <ShopcartIcon />
          <p v-if="cart.count">{{ cart.count }}</p>
        </NuxtLink>

        <!-- 搜尋 -->
        <div v-if="!isMinimal" class="search_btn">
          <SearchIcon />
          <form @submit.prevent="onSearch">
            <div class="search_box">
              <input
                v-model="keyword"
                type="text"
                autocomplete="off"
                placeholder="網站搜尋..."
                aria-label="網站搜尋"
              />
              <button type="submit" aria-label="搜尋"><SearchIcon /></button>
            </div>
          </form>
        </div>

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
    height: 70px;
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
      max-height: 60px;
    }
  }
}

.navbar {
  display: flex;
  padding-right: 4.1667vw;
}

.navmenu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    position: relative;

    > a {
      display: block;
      color: #fff;
      font-size: 16px;
      padding: 10px 20px;
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
        color: $web_header_1;
        background-size: 75% 1px;
      }
    }

    &:hover > .navmenu_sub,
    &:hover > .sp_dropdown {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0);
    }
  }
}

// 一般 children 下拉（沿用 Header02 風格：白底 + 主色字 hover）
.navmenu_sub {
  position: absolute;
  top: 100%;
  left: 50%;
  min-width: 160px;
  padding: 6px;
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
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover,
    &.router-link-active {
      background: var(--color-surface);
      color: $web_header_1;
    }
  }
}

// 產品 mega menu
.sp_dropdown {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100vw;
  padding: 60px 0 25px;
  background: #f8f8f8;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(8px);
  transition: all 0.3s;
}

.sp_inner {
  display: flex;
  max-width: 1420px;
  padding: 0 60px;
  margin: 0 auto;
}

.left {
  width: calc(320 / 1300 * 100%);
}

.overview_title {
  color: $web_header_1;
  font-size: 32px;
  font-weight: 700;
  padding-bottom: 22px;
  border-bottom: 1px solid $web_header_1;
  margin-bottom: 10px;

  @include rwd-1440 { font-size: 28px; }
}

.left > a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #c5c5c5;
  cursor: pointer;
  transition: all 0.3s;

  > span:first-child {
    color: $web_font_color;
    font-size: 20px;
    font-weight: 700;
    padding-right: 30px;
    transition: all 0.3s;

    @include rwd-1440 { font-size: 18px; }
    @include rwd-1280 { font-size: 16px; }
  }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
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
  padding-left: 75px;
}

.series_panel {
  display: none;

  &.active { display: flex; }
}

.series {
  width: calc(300 / 915 * 100%);
  padding-right: 30px;

  a {
    display: flex;
    align-items: center;
    color: $web_font_color;
    margin-bottom: 10px;
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
        width: 10px;
        margin-right: 10px;
      }
    }
  }
}

.quick_view {
  width: calc(615 / 915 * 100%);
  padding: 15px 25px 30px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.1);

  .quick_card {
    display: none;

    &.active { display: flex; }
  }
}

.quick_pic {
  width: 175px;

  img {
    width: 100%;
    display: block;
  }
}

.quick_info {
  width: calc(100% - 175px);
  padding-left: 35px;

  @include rwd-1440 { padding-left: 30px; }
}

.quick_title {
  color: $web_header_1;
  font-weight: 700;
  margin-bottom: 10px;
}

.quick_btn {
  display: inline-block;
  margin-top: 20px;
  padding: 8px 24px;
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
  margin-left: 20px;
  gap: 26px;

  > div,
  > a {
    display: flex;
    align-items: center;
    position: relative;
    color: #fff;
    font-size: 16px;
    padding: 10px 0;
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

    svg {
      display: block;
      width: 18px;
      height: 18px;
      fill: #fff;
      flex-shrink: 0;
      transition: all 0.3s;
    }

    &:hover {
      color: #9a9a9a;
      background-size: 100% 1px;
      transition: all 0.3s;

      svg { fill: #9a9a9a; }

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

  ul {
    position: absolute;
    top: 100%;
    left: 50%;
    min-width: max-content;
    padding-top: 9px;
    list-style: none;
    margin: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(-50%);
    transition: all 0.3s;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: calc(50% - 8px);
      border: 8px solid transparent;
      border-bottom-color: $web_header_2;
    }

    li button {
      display: block;
      width: 100%;
      color: #fff;
      font-size: 14px;
      text-align: center;
      padding: 10px 20px;
      background: $web_header_2;
      border: none;
      cursor: pointer;
      transition: all 0.3s;

      &:hover,
      &.active { background: $web_header_1; }
    }
  }
}

.cart_btn {
  position: relative;

  p {
    position: absolute;
    top: -2px;
    right: -10px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 99px;
    background: $web_header_1;
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.search_btn {
  form {
    position: absolute;
    top: 100%;
    right: -15px;
    width: fit-content;
    padding-top: 9px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.3s;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 15px;
      border: 8px solid transparent;
      border-bottom-color: $web_header_2;
    }
  }

  .search_box {
    display: flex;
    align-items: center;
    padding: 15px;
    background: $web_header_2;

    input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: #fff;
      font-size: 14px;

      &::placeholder { color: rgba(255, 255, 255, 0.6); }
    }

    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: 10px;
      display: flex;

      svg { width: 18px; height: 18px; fill: #fff; }
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
    width: 30px;
    height: 2px;

    .bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: 10px;

      &.bar1 {
        top: -8px;
        transition: top 0.3s 0.5s, transform 0.3s;
      }
      &.bar2 { transition: opacity 0s 0.3s; }
      &.bar3 {
        top: 8px;
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
  top: 70px;
  left: 0;
  right: 0;
  background: $web_header_2;
  padding: 8px 20px 16px;
  z-index: $z_mobile_menu;
}

.mb_navmenu_link {
  display: block;
  padding: 12px 4px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.mb_navmenu_sub {
  padding: 0 0 0 16px;

  a {
    display: block;
    padding: 8px 4px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
