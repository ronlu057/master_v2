<script setup>
// /admin 設定中心 tab
// 工作流程：
//   1. 載入時 GET /_admin/site-settings 取 JSON 目前值 + 可用版型清單
//   2. 使用者改值 → 寫入 localStorage (setPreview)，Header / Banner 立刻 reactive 切換
//   3. 按「提交寫回 site-settings.json」→ POST /_admin/site-settings，**不需重啟** dev server
//   4. 按「重置預覽」→ 清 localStorage，state 仍是預覽中的值（reload 才會回到 JSON 原值）

const { state, setPreview, clearPreview } = useEffectiveSettings()

const options = ref({
  projectTypes: ['module', 'custom-home', 'full-custom', 'shop', 'temp'],
  headers: [],
  pageBanners: [],
  blockBanners: [],
  langs: ['tw', 'en', 'jp', 'kr'],
})

// 專案類型中文對照（下拉選單顯示 「key - 中文名」）
const PROJECT_TYPE_LABELS = {
  module: '模組件套版',
  'custom-home': '客製首頁',
  'full-custom': '全部客製開發',
  shop: '購物類型',
  temp: '臨時站',
}
// 語系中文對照
const LANG_LABELS = {
  tw: '繁體中文',
  en: 'English',
  jp: '日本語',
  kr: '한국어',
}

// .env 中目前的「已寫回」值（用來和 state 比對顯示「未提交」標記）
const persisted = ref({})

const loading = ref(true)
const submitting = ref(false)
const message = ref(null)

const load = async () => {
  loading.value = true
  try {
    const res = await $fetch('/_admin/site-settings')
    options.value = res.options
    persisted.value = res.settings
    // persisted = 目前 site-settings.json 內的值
  } finally {
    loading.value = false
  }
}
onMounted(load)

// 是否有未提交變動（state vs persisted）
const dirty = computed(() => {
  const keys = ['projectType', 'header', 'pageBanner', 'blockBanner', 'apiBase', 'defaultLang', 'enableShop']
  return keys.some((k) => state[k] !== persisted.value[k])
})

const submit = async () => {
  submitting.value = true
  message.value = null
  try {
    const payload = {
      projectType: state.projectType,
      header: state.header,
      pageBanner: state.pageBanner,
      blockBanner: state.blockBanner,
      apiBase: state.apiBase,
      defaultLang: state.defaultLang,
      enableShop: state.enableShop,
    }
    await $fetch('/_admin/site-settings', { method: 'POST', body: payload })
    persisted.value = { ...payload }

    // 通知其他 tab：寫一個 timestamp 到 localStorage，觸發 storage event
    // 其他 tab 收到後會重新 fetch JSON 套到 state（站台 dispatcher 立即切版）
    if (import.meta.client) {
      localStorage.setItem('master_v2_settings_broadcast', String(Date.now()))
    }

    message.value = { type: 'success', text: '已寫回 site-settings.json 與 .env（兩處同步）。**不需重啟 dev server** — 站台 tab 立刻換版型。' }
  } catch (e) {
    message.value = { type: 'error', text: e.statusMessage || e.message }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="admin-settings">
    <h2 class="admin-settings__title">設定中心</h2>
    <p class="admin-settings__desc">
      改動會立刻寫入瀏覽器 localStorage 做預覽（Header / Banner 即時切換）。
      按「提交寫回 site-settings.json」才會把設定固化到專案 — **無需重啟 dev server**。
    </p>

    <div v-if="loading" class="admin-settings__loading">載入中…</div>

    <div v-else class="admin-settings__grid">
      <!-- 專案類型 -->
      <label class="field">
        <span class="field__label">專案類型</span>
        <select :value="state.projectType" @change="setPreview('projectType', $event.target.value)">
          <option v-for="t in options.projectTypes" :key="t" :value="t">
            {{ t }} - {{ PROJECT_TYPE_LABELS[t] || t }}
          </option>
        </select>
        <span class="field__hint">module / custom-home / full-custom / shop / temp</span>
      </label>

      <!-- Header 版型 -->
      <label class="field">
        <span class="field__label">Header 版型 <em class="field__live">即時預覽</em></span>
        <select :value="state.header" @change="setPreview('header', $event.target.value)">
          <option v-for="h in options.headers" :key="h" :value="h">{{ h }}</option>
        </select>
      </label>

      <!-- PageBanner 版型 -->
      <label class="field">
        <span class="field__label">PageBanner 版型 <em class="field__live">即時預覽</em></span>
        <select :value="state.pageBanner" @change="setPreview('pageBanner', $event.target.value)">
          <option v-for="b in options.pageBanners" :key="b" :value="b">{{ b }}</option>
        </select>
      </label>

      <!-- BlockBanner 版型 -->
      <label class="field">
        <span class="field__label">BlockBanner 版型 <em class="field__live">即時預覽</em></span>
        <select :value="state.blockBanner" @change="setPreview('blockBanner', $event.target.value)">
          <option v-for="b in options.blockBanners" :key="b" :value="b">{{ b }}</option>
        </select>
      </label>

      <!-- API base -->
      <label class="field">
        <span class="field__label">API base URL <em class="field__live">即時預覽</em></span>
        <input
          type="text"
          :value="state.apiBase"
          placeholder="留空=本地 mock"
          @input="setPreview('apiBase', $event.target.value)"
        />
        <span class="field__hint">下次 API 請求生效（composables/useApi.js 走 effective.apiBase）</span>
      </label>

      <!-- 預設語系 -->
      <label class="field">
        <span class="field__label">預設語系</span>
        <select :value="state.defaultLang" @change="setPreview('defaultLang', $event.target.value)">
          <option v-for="l in options.langs" :key="l" :value="l">
            {{ l }} - {{ LANG_LABELS[l] || l }}
          </option>
        </select>
        <span class="field__hint">由 i18n 模組讀，提交 .env 後仍需重啟 nuxt 才會切換預設語系</span>
      </label>

      <!-- 啟用購物 -->
      <label class="field field--checkbox">
        <input
          type="checkbox"
          :checked="state.enableShop"
          @change="setPreview('enableShop', $event.target.checked)"
        />
        <span>啟用購物功能（購物車 / 我的最愛）</span>
      </label>
    </div>

    <div class="admin-settings__actions">
      <button type="button" class="btn btn--ghost" @click="clearPreview">
        清除預覽（localStorage）
      </button>
      <button
        type="button"
        class="btn btn--primary"
        :disabled="!dirty || submitting"
        @click="submit"
      >
        {{ submitting ? '寫入中…' : dirty ? '提交寫回 site-settings.json' : '無變動' }}
      </button>
    </div>

    <p
      v-if="message"
      :class="['admin-settings__message', `admin-settings__message--${message.type}`]"
    >
      {{ message.text }}
    </p>

    <!-- navtool 6 icon 配置（開關 + 順序） -->
    <AdminNavtool />
  </div>
</template>

<style lang="scss" scoped>
.admin-settings__title { font-size: 22px; margin-bottom: 8px; }
.admin-settings__desc { color: #7a8896; font-size: 14px; margin-bottom: 24px; }
.admin-settings__loading { color: #7a8896; }

.admin-settings__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 13px;
    color: #c8cfdb;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__live {
    font-style: normal;
    font-size: 10px;
    color: #4fc08d;
    background: rgba(79, 192, 141, 0.1);
    padding: 1px 8px;
    border-radius: 99px;
  }

  &__hint { font-size: 11px; color: #6a7382; }

  select, input[type='text'] {
    padding: 9px 12px;
    background: #1a1f2a;
    color: #e6e9ef;
    border: 1px solid #2a3242;
    border-radius: 6px;
    font: inherit;

    &:focus { outline: 1px solid #4fc08d; border-color: #4fc08d; }
  }

  &--checkbox {
    flex-direction: row;
    align-items: center;
    grid-column: 1 / -1;
  }
}

.admin-settings__actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #232a38;
}

.btn {
  padding: 10px 22px;
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;

  &--primary {
    background: #4fc08d;
    color: #0f1218;
    font-weight: 600;

    &:hover:not(:disabled) { background: #6dd6a3; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--ghost {
    background: transparent;
    color: #c8cfdb;
    border-color: #2a3242;

    &:hover { background: #1f2532; }
  }
}

.admin-settings__message {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;

  &--success { background: rgba(79, 192, 141, 0.12); color: #6dd6a3; }
  &--error { background: rgba(224, 89, 75, 0.12); color: #ff8478; }
}
</style>
