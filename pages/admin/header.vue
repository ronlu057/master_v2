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

const dirty = computed(
  () =>
    ['header', 'logo', 'logoMaxHeight', 'customCss'].some(isDirtyKey) ||
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
