<script setup>
// /admin Settings tab 下的「navtool icon 配置」區塊
// 每個 Header 有自己的預設值與 localStorage；切換上方 Header 版型時，本區塊自動跟著切
const { items, toggle, setDisplay, setTextCase, setText, moveUp, moveDown, reset, resetAndReload, state, currentHeader } =
  useNavtoolConfig()
const { enableShop } = useProject()

const SHOP_DEPENDENT = ['member', 'cart', 'favorite']
const requiresShop = (key) => SHOP_DEPENDENT.includes(key)

// 顯示樣式三選一（全 Header 共用，全部版型皆支援）
const DISPLAY_OPTIONS = [
  { value: 'icon', label: '只有 Icon' },
  { value: 'both', label: 'Icon＋文字' },
  { value: 'text', label: '只有文字' },
]

// 文字大小寫三選一（主要影響英數；中日韓無視覺差異）
const CASE_OPTIONS = [
  { value: 'none', label: 'Aa 依輸入' },
  { value: 'upper', label: 'AA 全大寫' },
  { value: 'capitalize', label: 'Aa 首字大寫' },
]

// 多語系：只列「共用設定有啟用的語系」（enabledLangs 留空 → 全部 i18n locale）
const { locales } = useI18n()
const { state: siteState } = useEffectiveSettings()
const LANG_NAMES = { tw: '繁中', en: 'EN', jp: '日', kr: '韓' }
const langCodes = computed(() => {
  const all = (locales.value || []).map((l) => (typeof l === 'string' ? l : l.code))
  const enabled = Array.isArray(siteState.enabledLangs) && siteState.enabledLangs.length
    ? siteState.enabledLangs
    : all
  return all.filter((c) => enabled.includes(c))
})
// 取某項目某語系目前文字（item.text 為多語系物件）
const textVal = (item, lang) =>
  item.text && typeof item.text === 'object' ? item.text[lang] || '' : ''

// ── 改繁中(tw) → 自動翻譯其餘啟用語系（Gemini，dev-only）──────────
const translating = reactive({}) // { [item.key]: bool }
const translateMsg = ref(null)
const autoTranslate = async (item, twText) => {
  const text = (twText ?? '').trim()
  const targets = langCodes.value.filter((c) => c !== 'tw')
  if (!text || !targets.length) return
  translateMsg.value = null
  translating[item.key] = true
  try {
    const res = await $fetch('/_admin/ai-translate', {
      method: 'POST',
      body: { text, source: 'tw', targets },
    })
    const tr = res?.translations || {}
    for (const lang of targets) {
      if (tr[lang]) setText(item.key, lang, tr[lang])
    }
  } catch (e) {
    translateMsg.value = `自動翻譯失敗：${e?.data?.message || e?.statusMessage || e?.message || '未知錯誤'}`
  } finally {
    translating[item.key] = false
  }
}
// tw 欄位 change（失焦/Enter）時觸發翻譯；其餘語系只存值不翻譯
const onLangChange = (item, lang, value) => {
  if (lang === 'tw') autoTranslate(item, value)
}
</script>

<template>
  <div class="navtool-config">
    <div class="navtool-config__header">
      <h3>
        navtool icon 配置
        <span class="navtool-config__current">— {{ currentHeader }}</span>
      </h3>
      <span v-if="state.isPreviewing" class="navtool-config__badge">localStorage 覆寫中</span>
      <button type="button" class="navtool-config__reset" @click="reset">
        回到 {{ currentHeader }} 預設
      </button>
      <button
        type="button"
        class="navtool-config__reset navtool-config__reset--danger"
        @click="resetAndReload"
      >
        清全部並重整
      </button>
    </div>

    <p class="navtool-config__desc">
      <strong>每個 Header 有自己的 navtool 預設值</strong>，這裡正在編輯 <code>{{ currentHeader }}</code>。
      切換上方「Header 版型」即可看到其他 Header 的設定。
      順序從上到下對應 navtool 左到右。
      <br />
      每個項目可選顯示樣式 <code>只有 Icon</code> / <code>Icon＋文字</code> / <code>只有文字</code>，
      文字支援<strong>多語系</strong>＋<strong>大小寫</strong>。
      改<strong>繁中</strong>文字（失焦時）會<strong>自動 AI 翻譯</strong>其餘啟用語系。全 Header 版型皆適用。
    </p>
    <p v-if="translateMsg" class="navtool-config__translate-msg">{{ translateMsg }}</p>

    <ul class="navtool-config__list">
      <li v-for="(item, idx) in items" :key="item.key" class="navtool-config__row">
        <div class="navtool-config__main">
          <span class="navtool-config__order">{{ idx + 1 }}</span>
          <span class="navtool-config__icon">
            <i :class="['icon', `icon-${item.key === 'cart' ? 'shopcart' : item.key === 'favorite' ? 'like' : item.key === 'social' ? 'facebook' : item.key}`]"></i>
          </span>
          <span class="navtool-config__label">
            {{ item.label }}
            <span
              v-if="requiresShop(item.key)"
              class="navtool-config__shop-tag"
              :class="{ 'is-warn': item.enabled && !enableShop }"
              :title="enableShop ? '購物功能已啟用' : '需先到上方「啟用購物功能」打勾才會出現'"
            >
              {{ enableShop ? '購物' : '⚠ 需開購物' }}
            </span>
          </span>

          <label class="navtool-config__toggle">
            <input
              type="checkbox"
              :checked="item.enabled"
              @change="toggle(item.key, $event.target.checked)"
            />
            <span class="navtool-config__toggle-track">
              <span class="navtool-config__toggle-thumb"></span>
            </span>
          </label>

          <span class="navtool-config__move">
            <button
              type="button"
              :disabled="idx === 0"
              :aria-label="`往上移 ${item.label}`"
              @click="moveUp(item.key)"
            >▲</button>
            <button
              type="button"
              :disabled="idx === items.length - 1"
              :aria-label="`往下移 ${item.label}`"
              @click="moveDown(item.key)"
            >▼</button>
          </span>
        </div>

        <!-- 顯示樣式：Icon / Icon＋文字 / 只有文字 + 多語系可換文字 -->
        <div class="navtool-config__text">
          <span class="navtool-config__seg">
            <button
              v-for="opt in DISPLAY_OPTIONS"
              :key="opt.value"
              type="button"
              :class="{ on: (item.display || 'icon') === opt.value }"
              @click="setDisplay(item.key, opt.value)"
            >{{ opt.label }}</button>
          </span>
          <span
            v-if="(item.display || 'icon') !== 'icon'"
            class="navtool-config__seg"
          >
            <button
              v-for="opt in CASE_OPTIONS"
              :key="opt.value"
              type="button"
              :class="{ on: (item.textCase || 'none') === opt.value }"
              :title="`文字大小寫：${opt.label}`"
              @click="setTextCase(item.key, opt.value)"
            >{{ opt.label }}</button>
          </span>
          <div
            v-if="(item.display || 'icon') !== 'icon'"
            class="navtool-config__langs"
          >
            <label
              v-for="lang in langCodes"
              :key="lang"
              class="navtool-config__lang"
              :class="{ 'is-tw': lang === 'tw' }"
            >
              <span class="navtool-config__lang-code">
                {{ LANG_NAMES[lang] || lang.toUpperCase() }}
                <span v-if="lang === 'tw' && translating[item.key]" class="navtool-config__translating">翻譯中…</span>
              </span>
              <input
                type="text"
                :value="textVal(item, lang)"
                :disabled="lang !== 'tw' && translating[item.key]"
                :placeholder="lang === 'tw' ? '輸入後自動翻譯其他語系' : '留空＝用 tw'"
                @input="setText(item.key, lang, $event.target.value)"
                @change="onLangChange(item, lang, $event.target.value)"
              />
            </label>
          </div>
        </div>
      </li>
    </ul>

    <p class="navtool-config__note">
      ⚠ <strong>社群</strong>會渲染為一組並列的社群連結（FB / IG / LINE / YT / X），啟用時讀
      <code>firm.json</code> 的 <code>social</code> 區段，有填值才顯示。
      <br />
      ⚠ <strong>會員中心 / 購物車 / 我的最愛</strong> 為購物相關 icon，
      <strong>需上方「啟用購物功能」打勾才會出現</strong>。
      （在 admin 開「啟用購物」、或 projectType 選 <code>shop</code> 自動啟用）
      <br />
      路由：<code>/member</code> / <code>/shop/cart</code> / <code>/shop/favorite</code> — 若還沒做頁面點下去會 404。
    </p>
  </div>
</template>

<style lang="scss" scoped>
.navtool-config {
  margin-top: 32px;
  padding: 20px;
  background: #161b25;
  border: 1px solid #232a38;
  border-radius: 8px;
}

.navtool-config__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;

  h3 { font-size: 16px; margin: 0; }
}

.navtool-config__current {
  font-weight: 400;
  font-size: 13px;
  color: #6dd6a3;
  margin-left: 4px;
}

.navtool-config__badge {
  font-size: 11px;
  background: rgba(79, 192, 141, 0.15);
  color: #6dd6a3;
  padding: 2px 10px;
  border-radius: 99px;
}

.navtool-config__reset {
  background: transparent;
  color: #c8cfdb;
  border: 1px solid #2a3242;
  border-radius: 6px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;

  &:first-of-type { margin-left: auto; }

  &:hover { background: #1f2532; }

  &--danger {
    color: #ff8478;
    border-color: rgba(255, 132, 120, 0.3);

    &:hover { background: rgba(255, 132, 120, 0.1); }
  }
}

.navtool-config__desc {
  font-size: 12px;
  color: #7a8896;
  margin-bottom: 16px;
}

.navtool-config__translate-msg {
  margin: -8px 0 14px;
  padding: 8px 12px;
  font-size: 12px;
  color: #d4b170;
  background: rgba(255, 184, 0, 0.08);
  border: 1px solid rgba(255, 184, 0, 0.2);
  border-radius: 6px;
}

.navtool-config__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navtool-config__row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 10px;
  background: #1a1f2a;
  border: 1px solid #232a38;
  border-radius: 6px;
}

.navtool-config__main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.navtool-config__text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
  padding: 8px 10px 2px;
  margin-left: 36px;
  border-top: 1px dashed #232a38;
}

.navtool-config__seg {
  display: inline-flex;
  border: 1px solid #2a3242;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;

  button {
    padding: 5px 12px;
    font: inherit;
    font-size: 12px;
    background: #232a38;
    color: #e6e9ef;
    border: none;
    border-left: 1px solid #2a3242;
    cursor: pointer;
    white-space: nowrap;

    &:first-child { border-left: none; }

    &:hover:not(.on) { background: #2a3242; }

    &.on {
      background: #4fc08d;
      color: #0f1218;
      font-weight: 600;
    }
  }
}

.navtool-config__langs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.navtool-config__lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 160px;
  min-width: 140px;

  input {
    flex: 1;
    min-width: 0;
    padding: 6px 10px;
    background: #0f1218;
    color: #e6e9ef;
    border: 1px solid #2a3242;
    border-radius: 6px;
    font: inherit;
    font-size: 13px;

    &:focus {
      outline: 1px solid #4fc08d;
      border-color: #4fc08d;
    }
  }
}

.navtool-config__lang-code {
  flex-shrink: 0;
  min-width: 28px;
  font-size: 11px;
  color: #7a8896;
  text-align: center;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.navtool-config__lang.is-tw .navtool-config__lang-code {
  color: #6dd6a3;
}

.navtool-config__translating {
  font-size: 10px;
  color: #6dd6a3;
  white-space: nowrap;
  animation: navtool-blink 1s ease-in-out infinite;
}
@keyframes navtool-blink {
  50% { opacity: 0.4; }
}

.navtool-config__order {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #232a38;
  border-radius: 50%;
  font-size: 11px;
  color: #c8cfdb;
}

.navtool-config__icon {
  color: #c8cfdb;
  font-size: 18px;
  display: inline-flex;
}

.navtool-config__label {
  flex: 1;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.navtool-config__shop-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 99px;
  background: rgba(79, 192, 141, 0.12);
  color: #6dd6a3;

  &.is-warn {
    background: rgba(255, 184, 0, 0.12);
    color: #d4b170;
  }
}

.navtool-config__toggle {
  position: relative;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;

    &:checked + .navtool-config__toggle-track {
      background: #4fc08d;

      .navtool-config__toggle-thumb { transform: translateX(16px); }
    }
  }
}

.navtool-config__toggle-track {
  display: block;
  width: 36px;
  height: 20px;
  background: #2a3242;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.navtool-config__toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.navtool-config__move {
  display: flex;
  flex-direction: column;
  gap: 2px;

  button {
    width: 24px;
    height: 16px;
    background: transparent;
    color: #c8cfdb;
    border: 1px solid #2a3242;
    border-radius: 3px;
    font-size: 9px;
    cursor: pointer;
    line-height: 1;

    &:hover:not(:disabled) { background: #232a38; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}

.navtool-config__note {
  margin-top: 16px;
  padding: 10px 12px;
  background: rgba(255, 184, 0, 0.08);
  border: 1px solid rgba(255, 184, 0, 0.2);
  color: #d4b170;
  font-size: 11px;
  line-height: 1.6;
  border-radius: 6px;

  code {
    background: #0f1218;
    padding: 1px 5px;
    border-radius: 3px;
    color: #c8cfdb;
  }
}
</style>
