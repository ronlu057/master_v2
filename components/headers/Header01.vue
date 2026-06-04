<script setup>
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>
// 顏色用 CSS color、大小用 font-size 控制，不必 import SVG 元件
// 專案類型旗標：
//   label      = 中文名稱
//   isShop     = 是否購物類型（projectType=shop）
//   isMinimal  = 是否臨時站（只顯示 Logo + 聯絡鈕）
//   enableShop = 是否顯示購物 UI（shop 類型自動 true；其他類型可用 NUXT_PUBLIC_ENABLE_SHOP=true 強制開啟）
const { label, isShop, isMinimal, enableShop } = useProject()
// 行動版選單開關狀態
const ui = useUiStore()
// 購物車（cart.count 用於顯示徽章數字）
const cart = useCartStore()
// 主選單資料（header / mobile / footer），來自 /api/menu/view（mock JSON）
const { data: menuData } = useSiteMenu()
// 公司資料（取 social 連結用於 navtool 社群區塊）
const { data: firmData } = useSiteFirm()
// navtool icon 配置（哪些顯示 + 順序），由 /admin → navtool 配置控制
const navtool = useNavtoolConfig()

// 社群連結清單（過濾掉 null / 空字串 / 全空格的項目）
const socials = useSocials()

// 搜尋表單：input v-model 綁 keyword；submit 時帶 query 跳轉 /search
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

// 語系切換：接 @nuxtjs/i18n 模組
// languages 清單來自 nuxt.config.js 的 i18n.locales（單一來源，避免重複硬編碼）
// 切換語系呼叫 setLocale(code) — 全站翻譯字串 / locale 同步更新
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)
const currentLang = computed(() => locale.value)
const switchLang = (code) => setLocale(code)

// 捲動偵測：當 scrollTop 超過「banner 高 − header 高」時，給 header 加 .scroll class
// 對應原 jQuery if($(this).scrollTop() >= bannerH - headerH) addClass('scroll')
const headerEl = ref(null) // 對應 <header ref="headerEl">
const isScrolled = ref(false) // 控制 :class="{ scroll: isScrolled }"

const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  // banner 通常在 Header 外部，用 DOM query 取（class 開頭為 banner 的第一個元素）
  const banner = document.querySelector('[class^="banner"]')
  const bannerH = banner ? banner.offsetHeight : 0
  const scrollH = Math.max(0, bannerH - headerH)
  isScrolled.value = window.scrollY >= scrollH
}

// 註冊監聽器：scroll 用 passive 提升捲動效能；resize 是為了重算高度
onMounted(() => {
  updateScrollState() // 初始呼叫一次，取代原 jQuery 的 'load' 事件
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
})
// 元件卸載時務必清掉 listener，避免 memory leak
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <header ref="headerEl" :class="['header01', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" title="回首頁">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <nav v-if="!isMinimal" itemscope itemtype="https://www.schema.org/SiteNavigationElement">
        <ul class="navmenu">
          <li
            v-for="item in menuData.header"
            :key="item.url"
            class="navmenu__item"
            itemprop="name"
          >
            <NuxtLink :to="item.url" itemprop="url" class="navmenu__link">
              {{ item.title }}
            </NuxtLink>
            <div v-if="item.children?.length" class="navmenu__sub">
              <NuxtLink
                v-for="child in item.children"
                :key="child.url"
                :to="child.url"
                itemprop="url"
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </li>
        </ul>
      </nav>

      <div class="navtool">
        <template v-if="!isMinimal">
          <!-- 6 個 icon block 走 useNavtoolConfig 控顯示與順序（flex order） -->
          <!-- 搜尋 -->
          <div
            v-if="navtool.isEnabled('search')"
            class="navtool_icon"
            :style="{ order: navtool.orderOf('search') }"
          >
            <i class="icon icon-search" aria-label="搜尋"></i>
            <div class="search_box">
              <form class="search_form" @submit.prevent="onSearch">
                <input
                  v-model="keyword"
                  type="text"
                  autocomplete="off"
                  placeholder="網站搜尋..."
                  aria-label="網站搜尋"
                />
                <button type="submit" aria-label="搜尋">
                  <i class="icon icon-search" aria-hidden="true"></i>
                </button>
              </form>
            </div>
          </div>

          <!-- 語系（只有一個語系時不顯示，避免無謂的選單） -->
          <div
            v-if="navtool.isEnabled('language') && languages.length > 1"
            class="navtool_icon"
            :style="{ order: navtool.orderOf('language') }"
          >
            <i class="icon icon-language" aria-label="語系"></i>
            <div class="lang_box">
              <button
                v-for="lang in languages"
                :key="lang.code"
                type="button"
                class="lang_item"
                :class="{ 'is-active': lang.code === currentLang }"
                @click="switchLang(lang.code)"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>

          <!-- 社群（一排平鋪小 icon；從 firm.social 取有填值的） -->
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
              class="navtool_icon"
            >
              <i :class="['icon', `icon-${s.key}`]"></i>
            </a>
          </div>

          <!-- 會員中心 -->
          <NuxtLink
            v-if="navtool.isEnabled('member')"
            class="navtool_icon"
            to="/member"
            :style="{ order: navtool.orderOf('member') }"
            aria-label="會員中心"
          >
            <i class="icon icon-member"></i>
          </NuxtLink>

          <!-- 購物車 -->
          <NuxtLink
            v-if="navtool.isEnabled('cart')"
            class="navtool_icon cart_btn"
            to="/shop/cart"
            :style="{ order: navtool.orderOf('cart') }"
            aria-label="購物車"
          >
            <i class="icon icon-shopcart"></i>
            <div class="quantity_item">{{ cart.count || 0 }}</div>
          </NuxtLink>

          <!-- 我的最愛 -->
          <NuxtLink
            v-if="navtool.isEnabled('favorite')"
            class="navtool_icon"
            to="/shop/favorite"
            :style="{ order: navtool.orderOf('favorite') }"
            aria-label="我的最愛"
          >
            <i class="icon icon-like"></i>
          </NuxtLink>
        </template>

        <NuxtLink v-else to="/contact" class="btn btn--primary">聯絡我們</NuxtLink>

        <button
          v-if="!isMinimal"
          class="mbPanel_btn"
          aria-label="開啟選單"
          @click="ui.toggleMenu"
        >
          <span class="bars">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </span>
        </button>
      </div>
    </div>

    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="mb_panel">
        <div class="mb_navmenu">
          <div v-for="item in menuData.mobile" :key="item.url" class="mb_navmenu__item">
            <NuxtLink :to="item.url" class="mb_navmenu__link" @click="ui.closeMenu">
              {{ item.title }}
            </NuxtLink>
            <div v-if="item.children?.length" class="mb_navmenu__sub">
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
.header01 {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 80px;
  height: var(--header-h);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow);
  transition: background var(--transition), box-shadow var(--transition);

  &.scroll {
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(6px);
    box-shadow: var(--shadow-lg);
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-heading);

  &__badge {
    padding: 2px 10px;
    border-radius: 99px;
    background: var(--color-primary);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
}

.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.navmenu {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    position: relative;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 24px 20px;
    font-size: 16px;
    font-weight: 400;
    border-radius: var(--radius);

    &:hover,
    &.router-link-active {
      color: var(--color-primary);
    }
  }

  &__caret {
    font-size: 10px;
  }

  &__sub {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 160px;
    padding: 6px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    transition: all var(--transition);

    a {
      display: block;
      padding: 8px 12px;
      font-size: 14px;
      border-radius: 6px;

      &:hover {
        background: var(--color-surface);
        color: var(--color-primary);
      }
    }
  }

  &__item:hover &__sub {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.mb_navmenu {
  &__link {
    display: block;
    padding: 12px 4px;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
  }

  &__sub {
    padding: 0 0 0 16px;

    a {
      display: block;
      padding: 8px 4px;
      font-size: 14px;
    }
  }
}

.navtool {
  display: flex;
  align-items: center;
  gap: 26px;
  font-size: 18px;

  // .navtool_social 樣式走全域 main.scss（沿用 _header02.scss 圓形深底白 icon 風格）

  .navtool_icon {
    position: relative;
    cursor: pointer;
    color: $web_font_color;
    transition: color 0.3s;

    > .icon {
      font-size: 20px;
    }

    &:hover,
    &:focus-within {
      color: var(--color-primary);
    }

    // popup 浮層（搜尋框 / 語系列表 共用樣式）
    .search_box,
    .lang_box {
      position: absolute;
      top: 100%;
      right: 0;
      padding: 10px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all var(--transition);
      z-index: 60;
      margin-top: 26px;
    }
    .search_box { min-width: 280px; }
    .lang_box {
      min-width: 140px;
      display: flex;
      flex-direction: column;
      padding: 6px;
    }

    &:hover .search_box,
    &:focus-within .search_box,
    &:hover .lang_box,
    &:focus-within .lang_box {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    // 語系選項
    .lang_item {
      background: none;
      border: none;
      padding: 8px 12px;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      border-radius: 6px;
      color: inherit;

      &:hover {
        background: var(--color-surface);
        color: var(--color-primary);
      }

      &.is-active {
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  }

  .search_form {
    display: flex;
    align-items: center;
    gap: 6px;

    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      font-size: 14px;
    }

    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      color: $web_font_color;
      transition: color 0.3s;

      .icon { font-size: 18px; }

      &:hover { color: var(--color-primary); }
    }
  }
}

.cart_btn {
  position: relative;
  display: inline-flex;
  align-items: center;

  // 徽章：icon 右上角的數字小紅點（p 給 cart.count 用、.quantity_item 給寫死數字用）
  p,
  .quantity_item {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mbPanel_btn {
  display: none;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;

  .bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bar {
    width: 22px;
    height: 2px;
    background: var(--color-heading);
  }
}

.mb_panel {
  position: absolute;
  top: var(--header-h);
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 8px 20px 16px;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}

@include rwd-1200 {
  .header01 {
    height: 64px;
  }
  .logo {
    font-size: 18px;
  }
}

@include rwd-768 {
  .navmenu,
  .navtool_icon {
    display: none;
  }
  .mbPanel_btn {
    display: block;
  }
}
</style>
