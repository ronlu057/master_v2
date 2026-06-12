<script setup>
// /admin/header — Header 模組設定
//   - 版型切換（NUXT_PUBLIC_HEADER）
//   - LOGO 上傳 + 最大高度
//   - navtool icon 配置（AdminNavtool 元件 — per-Header preset）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, persisted, submitting, load, submit, setPreview, isDirtyKey } =
  useSiteSettings()

onMounted(load)

// 語系顯示文字（後台覆寫；留空 → 各版型預設）
const LANG_NAMES = { tw: '繁體中文', en: 'English', jp: '日本語', kr: '한국어' }
const onLangLabelInput = (lang, value) => {
  setPreview('langLabels', { ...(state.langLabels || {}), [lang]: value })
}

// ── Header 背景色 ───────────────────────────────────────────
// 值的三種型態：''＝版型預設、'transparent'＝透明、'#rrggbb' / 'rgba(r,g,b,a)'＝指定色
// 強制套用到所有狀態（含捲動後 / 內頁）— 注入邏輯在 app.vue
const parseColor = (v) => {
  if (!v || v === 'transparent') return { hex: '#000000', alpha: 100 }
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i)
  if (m) {
    const hex =
      '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
    return { hex, alpha: m[4] === undefined ? 100 : Math.round(parseFloat(m[4]) * 100) }
  }
  // #rgb → #rrggbb
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return { hex: '#' + v.slice(1).split('').map((c) => c + c).join(''), alpha: 100 }
  }
  return { hex: /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000', alpha: 100 }
}
const composeColor = (hex, alpha) => {
  if (alpha >= 100) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`
}

const _init = parseColor(state.headerBgColor)
const customHex = ref(_init.hex)
const customAlpha = ref(_init.alpha)

const bgMode = computed(() => {
  const v = state.headerBgColor || ''
  if (!v) return 'default'
  if (v === 'transparent') return 'transparent'
  return 'custom'
})

const setBgMode = (mode) => {
  if (mode === 'default') setPreview('headerBgColor', '')
  else if (mode === 'transparent') setPreview('headerBgColor', 'transparent')
  else setPreview('headerBgColor', composeColor(customHex.value, customAlpha.value))
}
const onBgColorInput = (hex) => {
  customHex.value = hex
  setPreview('headerBgColor', composeColor(hex, customAlpha.value))
}
const onBgAlphaInput = (a) => {
  customAlpha.value = a
  setPreview('headerBgColor', composeColor(customHex.value, a))
}

const dirty = computed(
  () =>
    ['header', 'logo', 'logoMaxHeight', 'customCss', 'headerBgColor'].some(isDirtyKey) ||
    JSON.stringify(state.langLabels || {}) !==
      JSON.stringify(persisted.value.langLabels || {}),
)

const message = ref(null)
const onSubmit = async () => {
  const res = await submit()
  message.value = res.ok
    ? { type: 'success', text: '已寫回 site-settings.json 與 .env，站台立即生效。' }
    : { type: 'error', text: res.message }
}

// LOGO 上傳
const logoInput = ref(null)
const logoUploading = ref(false)
const logoMessage = ref(null)
const DEFAULT_LOGO = '/img/logo/logo-AD.svg'

const onLogoPick = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  logoUploading.value = true
  logoMessage.value = null
  try {
    const form = new FormData()
    form.append('logo', file)
    const res = await $fetch('/_admin/upload-logo', { method: 'POST', body: form })
    setPreview('logo', res.path)
    logoMessage.value = { type: 'success', text: `已上傳：${res.path}（按下方「提交」固化）` }
  } catch (err) {
    logoMessage.value = { type: 'error', text: err.statusMessage || err.message }
  } finally {
    logoUploading.value = false
    if (logoInput.value) logoInput.value.value = ''
  }
}
const onLogoReset = () => {
  setPreview('logo', '')
  logoMessage.value = { type: 'success', text: '已重置為預設 LOGO' }
}

const codeHint = `/* LOGO 高度也可這樣覆寫（預設由 logoMaxHeight 控） */
.site-logo { height: 60px; }

/* 只在 Header02 套用特殊樣式 */
.header02 .site-logo { filter: drop-shadow(0 2px 4px rgba(0,0,0,.2)); }

/* Header 整條換背景 */
.header01 { background: #f5f5f5; }`
</script>

<template>
  <div class="page">
    <h1 class="page__title">Header 模組</h1>
    <p class="page__desc">
      切換 Header 版型、上傳 LOGO、配置 navtool 6 個 icon。
      <strong>navtool 設定 per-Header 獨立保存</strong> — 切版型即看到該版的 toggle / 排序。
    </p>

    <!-- Header 版型 -->
    <div class="grid">
      <label class="field field--full">
        <span class="field__label">Header 版型 <em class="field__live">即時預覽</em></span>
        <select :value="state.header" @change="setPreview('header', $event.target.value)">
          <option v-for="h in options.headers" :key="h" :value="h">{{ h }}</option>
        </select>
      </label>

      <!-- LOGO 上傳 -->
      <div class="field field--full">
        <span class="field__label">站台 LOGO <em class="field__live">即時預覽</em></span>
        <div class="logo-uploader">
          <div class="logo-uploader__preview">
            <SiteLogo alt="logo preview" />
          </div>
          <div class="logo-uploader__controls">
            <p class="logo-uploader__current">
              目前：<code>{{ state.logo || DEFAULT_LOGO + '（預設）' }}</code>
            </p>
            <div class="logo-uploader__actions">
              <label class="btn btn--ghost btn--sm">
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp"
                  hidden
                  @change="onLogoPick"
                />
                {{ logoUploading ? '上傳中…' : '選檔上傳' }}
              </label>
              <button
                v-if="state.logo"
                type="button"
                class="btn btn--ghost btn--sm"
                @click="onLogoReset"
              >
                改回預設
              </button>
            </div>
            <p class="field__hint">支援 jpg / png / svg / gif / webp，限 2 MB。存到 <code>public/img/logo/</code></p>
          </div>
        </div>
        <p
          v-if="logoMessage"
          :class="['msg', `msg--${logoMessage.type}`]"
        >
          {{ logoMessage.text }}
        </p>
      </div>

      <!-- LOGO 高度 -->
      <label class="field field--full">
        <span class="field__label">LOGO 最大高度 <em class="field__live">即時預覽</em></span>
        <div class="height-input">
          <input
            type="range"
            min="20"
            max="120"
            step="1"
            :value="state.logoMaxHeight"
            @input="setPreview('logoMaxHeight', Number($event.target.value) || 66)"
          />
          <div class="height-input__num">
            <input
              type="number"
              min="20"
              max="200"
              :value="state.logoMaxHeight"
              @input="setPreview('logoMaxHeight', Number($event.target.value) || 66)"
            />
            <span>px</span>
          </div>
        </div>
        <span class="field__hint">寬度自動；常用 40 ~ 80</span>
      </label>

      <!-- Header 背景色（全站共用，強制套用所有狀態） -->
      <div class="field field--full">
        <span class="field__label">Header 背景色 <em class="field__live">即時預覽</em></span>
        <div class="bg-picker">
          <div class="bg-picker__modes">
            <label :class="{ 'is-on': bgMode === 'default' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'default'"
                @change="setBgMode('default')"
              />
              版型預設
            </label>
            <label :class="{ 'is-on': bgMode === 'transparent' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'transparent'"
                @change="setBgMode('transparent')"
              />
              透明
            </label>
            <label :class="{ 'is-on': bgMode === 'custom' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'custom'"
                @change="setBgMode('custom')"
              />
              指定顏色
            </label>
          </div>

          <div v-if="bgMode === 'custom'" class="bg-picker__custom">
            <input
              type="color"
              :value="customHex"
              @input="onBgColorInput($event.target.value)"
            />
            <div class="bg-picker__alpha">
              <span>不透明度</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="customAlpha"
                @input="onBgAlphaInput(Number($event.target.value))"
              />
              <span class="bg-picker__alpha-num">{{ customAlpha }}%</span>
            </div>
            <code class="bg-picker__val">{{ state.headerBgColor }}</code>
          </div>
        </div>
        <span class="field__hint">
          強制套用到所有狀態（含捲動後 / 內頁）。<strong>透明</strong>可讓 header 疊在 banner 上；
          <strong>版型預設</strong>＝交還給版型自身設計（含原本捲動變色效果）。
        </span>
      </div>
    </div>

    <div class="actions">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="!dirty || submitting"
        @click="onSubmit"
      >
        {{ submitting ? '寫入中…' : dirty ? '提交寫回 site-settings.json + .env' : '無變動' }}
      </button>
    </div>

    <p
      v-if="message"
      :class="['msg', `msg--${message.type}`]"
    >
      {{ message.text }}
    </p>

    <!-- 自訂 CSS — 全域注入，可覆寫 .site-logo / .headerXX 等 -->
    <section class="page__section">
      <h2 class="page__section-title">自訂 CSS <em class="field__live">即時預覽</em></h2>
      <p class="page__desc" style="margin-bottom: 12px">
        輸入純 CSS，會即時注入到站台 <code>&lt;head&gt;</code>。可覆寫 LOGO / Header 任何樣式 — 例如：
      </p>
      <pre class="code-hint">{{ codeHint }}</pre>
      <textarea
        class="css-editor"
        :value="state.customCss"
        spellcheck="false"
        placeholder=".site-logo { ... }"
        @input="setPreview('customCss', $event.target.value)"
      ></textarea>
    </section>

    <!-- 語系顯示文字 — 全站各 header 共用；留空＝版型預設 -->
    <section class="page__section">
      <h2 class="page__section-title">語系顯示文字 <em class="field__live">即時預覽</em></h2>
      <p class="page__desc" style="margin-bottom: 12px">
        自訂每個語系在 header 語系切換上顯示的文字（全站所有 header 共用）。
        <strong>留空＝沿用版型預設</strong> — Header04 顯示縮寫（TW/EN…），其餘版型顯示語系全名。
      </p>
      <div class="grid">
        <label v-for="lang in options.langs" :key="lang" class="field">
          <span class="field__label">{{ LANG_NAMES[lang] || lang }}（{{ lang }}）</span>
          <input
            type="text"
            :value="state.langLabels?.[lang] || ''"
            placeholder="留空＝版型預設"
            @input="onLangLabelInput(lang, $event.target.value)"
          />
        </label>
      </div>
    </section>

    <!-- navtool 配置（per-Header） -->
    <section class="page__section">
      <AdminNavtool />
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.logo-uploader {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    min-width: 120px;
    min-height: 80px;
    background: #fff;
    border-radius: 6px;
    flex-shrink: 0;

    .site-logo { display: block; }
  }

  &__controls { flex: 1; min-width: 0; }

  &__current {
    font-size: 12px;
    color: #c8cfdb;
    margin-bottom: 8px;
    word-break: break-all;

    code {
      background: #0f1218;
      padding: 1px 6px;
      border-radius: 3px;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
}

.code-hint {
  background: #0f1218;
  color: #6a7382;
  border: 1px solid #232a38;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 12px;
  overflow-x: auto;
}

.css-editor {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  background: #1a1f2a;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
}

.bg-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__modes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #1a1f2a;
      border: 1px solid #2a3242;
      border-radius: 6px;
      font-size: 13px;
      color: #c8cfdb;
      cursor: pointer;
      transition: all 0.2s;

      &.is-on {
        border-color: #4fc08d;
        color: #fff;
      }

      input { accent-color: #4fc08d; cursor: pointer; }
    }
  }

  &__custom {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 12px 14px;
    background: #1a1f2a;
    border: 1px solid #2a3242;
    border-radius: 8px;

    input[type='color'] {
      width: 48px;
      height: 36px;
      padding: 0;
      background: none;
      border: 1px solid #2a3242;
      border-radius: 6px;
      cursor: pointer;
    }
  }

  &__alpha {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #7a8896;

    input[type='range'] {
      width: 140px;
      height: 4px;
      background: #2a3242;
      border-radius: 4px;
      appearance: none;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        background: #4fc08d;
        border-radius: 50%;
        cursor: pointer;
      }
      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #4fc08d;
        border: none;
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }

  &__alpha-num {
    min-width: 38px;
    color: #c8cfdb;
  }

  &__val {
    margin-left: auto;
    padding: 4px 10px;
    background: #0f1218;
    color: #6a7382;
    border-radius: 4px;
    font-size: 12px;
  }
}

.height-input {
  display: flex;
  align-items: center;
  gap: 14px;

  input[type='range'] {
    flex: 1;
    height: 4px;
    background: #2a3242;
    border-radius: 4px;
    appearance: none;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #4fc08d;
      border-radius: 50%;
      cursor: pointer;
    }
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #4fc08d;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  &__num {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #1a1f2a;
    border: 1px solid #2a3242;
    border-radius: 6px;
    padding: 0 10px 0 4px;

    input[type='number'] {
      width: 56px;
      padding: 7px 4px;
      background: transparent;
      color: #e6e9ef;
      border: none;
      outline: none;
      font: inherit;
      text-align: right;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button { appearance: none; margin: 0; }
    }
    span { font-size: 12px; color: #7a8896; }
  }
}
</style>
