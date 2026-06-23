<script setup>
// /admin — 共用設定（projectType / apiBase / defaultLang / enableShop）
// Header / Banner / Footer / LOGO 等模組設定請進對應子頁面
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, persisted, submitting, load, submit, setPreview, clearPreview, isDirtyKey } =
  useSiteSettings()

const PROJECT_TYPE_LABELS = {
  module: '模組件套版',
  'custom-home': '客製首頁',
  'full-custom': '全部客製開發',
  shop: '購物類型',
  temp: '臨時站',
}
const LANG_LABELS = {
  tw: '繁體中文',
  en: 'English',
  jp: '日本語',
  kr: '한국어',
}

onMounted(load)

// ── 啟用語系：站台實際提供哪些語系（空＝全部）──────────────────
const enabledLangs = computed(() =>
  Array.isArray(state.enabledLangs) && state.enabledLangs.length
    ? state.enabledLangs
    : options.value.langs,
)
const isLangOn = (l) => enabledLangs.value.includes(l)
const toggleLang = (l, on) => {
  let next = enabledLangs.value.filter((x) => x !== l)
  if (on) next.push(l)
  if (!next.length) return // 至少保留一個語系
  // 依官方語系順序排序，保持穩定
  next = options.value.langs.filter((x) => next.includes(x))
  setPreview('enabledLangs', next)
  // 預設語系若被停用 → 自動改成第一個啟用語系
  if (!next.includes(state.defaultLang)) setPreview('defaultLang', next[0])
}

// 語系顯示文字（後台覆寫；留空 → 各版型預設）— 只對啟用語系開放
const onLangLabelInput = (lang, value) => {
  setPreview('langLabels', { ...(state.langLabels || {}), [lang]: value })
}

const dirty = computed(
  () =>
    ['projectType', 'apiBase', 'defaultLang', 'enableShop'].some(isDirtyKey) ||
    JSON.stringify(state.enabledLangs || []) !==
      JSON.stringify(persisted.value.enabledLangs || []) ||
    JSON.stringify(state.langLabels || {}) !== JSON.stringify(persisted.value.langLabels || {}),
)

const message = ref(null)
const onSubmit = async () => {
  const res = await submit()
  message.value = res.ok
    ? { type: 'success', text: '已寫回 site-settings.json 與 .env，站台立即生效。' }
    : { type: 'error', text: res.message }
}
</script>

<template>
  <div class="page">
    <h1 class="page__title">共用設定</h1>
    <p class="page__desc">跨所有模組共用的基礎設定。改值會立即寫入 localStorage 預覽，按「提交」固化到專案。</p>

    <div class="grid">
      <label class="field">
        <span class="field__label">專案類型</span>
        <select :value="state.projectType" @change="setPreview('projectType', $event.target.value)">
          <option v-for="t in options.projectTypes" :key="t" :value="t">
            {{ t }} - {{ PROJECT_TYPE_LABELS[t] || t }}
          </option>
        </select>
        <span class="field__hint">module / custom-home / full-custom / shop / temp</span>
      </label>

      <label class="field">
        <span class="field__label">API base URL <em class="field__live">即時預覽</em></span>
        <input
          type="text"
          :value="state.apiBase"
          placeholder="留空=本地 mock"
          @input="setPreview('apiBase', $event.target.value)"
        />
        <span class="field__hint">下次 API 請求生效（useApi.js 走 effective.apiBase）</span>
      </label>

      <div class="field field--full">
        <span class="field__label">啟用語系 <em class="field__live">即時預覽</em></span>
        <div class="lang-toggles">
          <label
            v-for="l in options.langs"
            :key="l"
            class="lang-toggle"
            :class="{ 'is-on': isLangOn(l) }"
          >
            <input
              type="checkbox"
              :checked="isLangOn(l)"
              :disabled="isLangOn(l) && enabledLangs.length === 1"
              @change="toggleLang(l, $event.target.checked)"
            />
            {{ l }} - {{ LANG_LABELS[l] || l }}
          </label>
        </div>
        <span class="field__hint">勾選站台實際提供的語系；前台語系切換清單即時跟著變（至少保留一個）。</span>
      </div>

      <label class="field">
        <span class="field__label">預設語系</span>
        <select :value="state.defaultLang" @change="setPreview('defaultLang', $event.target.value)">
          <option v-for="l in enabledLangs" :key="l" :value="l">
            {{ l }} - {{ LANG_LABELS[l] || l }}
          </option>
        </select>
        <span class="field__hint">只能從「啟用語系」中選；i18n 模組預設語系（提交 .env 後仍需重啟才會切換預設）</span>
      </label>

      <label class="field field--checkbox">
        <input
          type="checkbox"
          :checked="state.enableShop"
          @change="setPreview('enableShop', $event.target.checked)"
        />
        <span>啟用購物功能（會員 / 購物車 / 我的最愛 才會出現）</span>
      </label>
    </div>

    <div class="actions">
      <button type="button" class="btn btn--ghost" @click="clearPreview">清除預覽（localStorage）</button>
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

    <!-- 語系顯示文字 — 只對「啟用語系」開放；全站各 header 共用，留空＝版型預設 -->
    <section class="page__section">
      <h2 class="page__section-title">語系顯示文字 <em class="field__live">即時預覽</em></h2>
      <p class="page__desc" style="margin-bottom: 12px">
        自訂每個語系在 header 語系切換上顯示的文字（全站所有 header 共用）。
        <strong>只會列出上方「啟用語系」勾選的語系</strong>；留空＝沿用版型預設 —
        Header04 顯示縮寫（TW/EN…），其餘版型顯示語系全名。
      </p>
      <div class="grid">
        <label v-for="lang in enabledLangs" :key="lang" class="field">
          <span class="field__label">{{ LANG_LABELS[lang] || lang }}（{{ lang }}）</span>
          <input
            type="text"
            :value="state.langLabels?.[lang] || ''"
            placeholder="留空＝版型預設"
            @input="onLangLabelInput(lang, $event.target.value)"
          />
        </label>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.lang-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lang-toggle {
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
</style>
