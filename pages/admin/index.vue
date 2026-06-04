<script setup>
// /admin — 共用設定（projectType / apiBase / defaultLang / enableShop）
// Header / Banner / Footer / LOGO 等模組設定請進對應子頁面
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, submitting, load, submit, setPreview, clearPreview, isDirtyKey } =
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

const dirty = computed(() =>
  ['projectType', 'apiBase', 'defaultLang', 'enableShop'].some(isDirtyKey),
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

      <label class="field">
        <span class="field__label">預設語系</span>
        <select :value="state.defaultLang" @change="setPreview('defaultLang', $event.target.value)">
          <option v-for="l in options.langs" :key="l" :value="l">
            {{ l }} - {{ LANG_LABELS[l] || l }}
          </option>
        </select>
        <span class="field__hint">i18n 模組預設語系（提交 .env 後仍需重啟才會切換預設）</span>
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
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;
</style>
