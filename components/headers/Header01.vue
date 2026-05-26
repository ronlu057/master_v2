<script setup>
// SVG 以 Vue 元件方式 inline 進 HTML（可用 CSS 控制 fill）
import SearchIcon from '~/assets/icon/search_icon.svg?component'
import LanguageIcon from '~/assets/icon/language_icon.svg?component'

// 專案類型旗標：label=中文名稱、isShop=是否購物站、isMinimal=是否臨時站（只顯示 Logo + 聯絡鈕）
const { label, isShop, isMinimal } = useProject()
// 行動版選單開關狀態
const ui = useUiStore()
// 購物車（cart.count 用於顯示徽章數字）
const cart = useCartStore()
// 主選單資料（header / mobile / footer），來自 /api/menu/view（mock JSON）
const { data: menuData } = useSiteMenu()

// 搜尋表單：input v-model 綁 keyword；submit 時帶 query 跳轉 /search
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

// 語系切換：currentLang 為目前語系；切換時改 currentLang（之後接 i18n 時改成切換 locale）
const languages = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]
const currentLang = ref('zh-TW')
const switchLang = (code) => {
  currentLang.value = code
}

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
      <img src="/img/logo/logo-AD.svg" alt="Logo" />
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
          <div class="navtool_icon">
            <SearchIcon aria-label="搜尋" />
            <div class="search_box">
              <form class="search_form" @submit.prevent="onSearch">
                <input
                  v-model="keyword"
                  type="text"
                  autocomplete="off"
                  placeholder="網站搜尋..."
                  aria-label="網站搜尋"
                />
                <button type="submit" aria-label="搜尋"><SearchIcon aria-label="搜尋" /></button>
              </form>
            </div>
          </div>

          <div class="navtool_icon">
            <LanguageIcon aria-label="語系" />
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

          <div class="navtool_icon">購物車 版型式購物車出現 但是先讓我看的到</div>
          <div class="navtool_icon">我的最愛 與購物車一樣有購物車版型才會有</div>

          <NuxtLink v-if="isShop" class="cart_btn" to="/shop/cart" aria-label="購物車">
            🛍️
            <p v-if="cart.count">{{ cart.count }}</p>
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

  .navtool_icon {
    position: relative;
    cursor: pointer;
    padding: 26px 0px;

    > svg {
      display: block;
      width: 20px;
      height: 20px;
      fill: $web_font_color;
      transition: all 0.3s;
    }

    &:hover > svg,
    &:focus-within > svg {
      fill: var(--color-primary);
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

      svg {
        width: 18px;
        height: 18px;
        fill: $web_font_color;
        transition: fill 0.3s;
      }

      &:hover svg {
        fill: var(--color-primary);
      }
    }
  }
}

.cart_btn {
  position: relative;
  display: inline-flex;
  align-items: center;

  p {
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
    line-height: 18px;
    text-align: center;
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

@media (max-width: 1200px) {
  .header01 {
    height: 64px;
  }
  .logo {
    font-size: 18px;
  }
}

@media (max-width: 860px) {
  .navmenu,
  .navtool_icon {
    display: none;
  }
  .mbPanel_btn {
    display: block;
  }
}
</style>
