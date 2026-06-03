<script setup>
// /admin 檔案生成 tab
// 三類型可生成：Header / Banner / Mock JSON
// 生成後檔案立即出現在 components/headers, components/banners, server/mock/data
// Header / Banner 新版型立即可在「設定中心」下拉選單看到（reload 後）

const type = ref('header')
const types = [
  { key: 'header', label: '新增 Header', desc: '複製既有 Header 樣板，class 名自動替換為新名稱' },
  { key: 'banner', label: '新增 Banner', desc: '可選 PageBanner / BlockBanner 兩種命名' },
  { key: 'mock', label: '新增 Mock JSON', desc: '建立空白或從貼上的 JSON 文字建立新檔' },
]

const headerOpts = ref([])
const bannerOpts = ref({ page: [], block: [] })

const form = ref({
  name: '',
  basedOn: '',
  mockContent: '{\n  \n}',
})

const result = ref(null)
const error = ref(null)
const busy = ref(false)

const loadOptions = async () => {
  const res = await $fetch('/_admin/site-settings')
  headerOpts.value = res.options.headers
  bannerOpts.value = {
    page: res.options.pageBanners,
    block: res.options.blockBanners,
  }
  // 預設範本：用第一個
  if (type.value === 'header') form.value.basedOn = headerOpts.value[0] || 'Header01'
  if (type.value === 'banner') form.value.basedOn = bannerOpts.value.page[0] || 'PageBanner01'
}
onMounted(loadOptions)

watch(type, (t) => {
  result.value = null
  error.value = null
  if (t === 'header') form.value.basedOn = headerOpts.value[0] || 'Header01'
  if (t === 'banner') form.value.basedOn = bannerOpts.value.page[0] || 'PageBanner01'
  if (t === 'mock') form.value.basedOn = ''
})

// banner 範本清單依命名決定（PageBannerXX 或 BlockBannerXX）
const bannerTemplates = computed(() => {
  if (form.value.name.startsWith('Block')) return bannerOpts.value.block
  return bannerOpts.value.page
})

const submit = async () => {
  busy.value = true
  result.value = null
  error.value = null
  try {
    const body = {
      type: type.value,
      name: form.value.name.trim(),
      basedOn: form.value.basedOn,
    }
    if (type.value === 'mock') body.content = form.value.mockContent
    const res = await $fetch('/_admin/scaffold', { method: 'POST', body })
    result.value = res
    await loadOptions()
    // 不清空 name，方便連續看到結果
  } catch (e) {
    error.value = e.statusMessage || e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="admin-scaffold">
    <h2 class="admin-scaffold__title">檔案生成</h2>
    <p class="admin-scaffold__desc">
      一鍵生成新的 Header / Banner / Mock JSON 檔案，新建後立即出現在對應目錄。
    </p>

    <div class="admin-scaffold__type-picker">
      <button
        v-for="t in types"
        :key="t.key"
        type="button"
        :class="['admin-scaffold__type', { 'is-active': type === t.key }]"
        @click="type = t.key"
      >
        <span class="admin-scaffold__type-label">{{ t.label }}</span>
        <span class="admin-scaffold__type-desc">{{ t.desc }}</span>
      </button>
    </div>

    <div class="admin-scaffold__form">
      <label class="field">
        <span class="field__label">新檔名（不含 .vue / .json）</span>
        <input
          v-model="form.name"
          type="text"
          :placeholder="type === 'header' ? 'Header17' : type === 'banner' ? 'PageBanner02 或 BlockBanner02' : 'custom_data'"
        />
        <span class="field__hint">只能用英文、數字、底線、連字符</span>
      </label>

      <label v-if="type === 'header'" class="field">
        <span class="field__label">複製哪個 Header 作為起點？</span>
        <select v-model="form.basedOn">
          <option v-for="h in headerOpts" :key="h" :value="h">{{ h }}</option>
        </select>
      </label>

      <label v-if="type === 'banner'" class="field">
        <span class="field__label">複製哪個 Banner 作為起點？</span>
        <select v-model="form.basedOn">
          <option v-for="b in bannerTemplates" :key="b" :value="b">{{ b }}</option>
        </select>
        <span class="field__hint">
          檔名以 <code>Block</code> 開頭會列出 BlockBanner 樣板，其他列出 PageBanner
        </span>
      </label>

      <label v-if="type === 'mock'" class="field">
        <span class="field__label">起始 JSON 內容（可留空白物件）</span>
        <textarea
          v-model="form.mockContent"
          class="admin-scaffold__textarea"
          spellcheck="false"
          autocomplete="off"
        ></textarea>
      </label>
    </div>

    <div class="admin-scaffold__actions">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="!form.name.trim() || busy"
        @click="submit"
      >
        {{ busy ? '生成中…' : '生成檔案' }}
      </button>
    </div>

    <div v-if="result" class="admin-scaffold__result admin-scaffold__result--success">
      ✓ 已建立：<code>{{ result.path }}</code>
      <span v-if="result.basedOn"> · 複製自 <code>{{ result.basedOn }}</code></span>
    </div>
    <div v-if="error" class="admin-scaffold__result admin-scaffold__result--error">
      ✗ {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-scaffold__title { font-size: 22px; margin-bottom: 8px; }
.admin-scaffold__desc { color: #7a8896; font-size: 14px; margin-bottom: 24px; }

.admin-scaffold__type-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.admin-scaffold__type {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 16px;
  background: #161b25;
  border: 1px solid #232a38;
  border-radius: 8px;
  color: #c8cfdb;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #1f2532; }

  &.is-active {
    background: rgba(79, 192, 141, 0.08);
    border-color: #4fc08d;
  }
}

.admin-scaffold__type-label { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.admin-scaffold__type-desc { font-size: 11px; color: #7a8896; line-height: 1.4; }

.admin-scaffold__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label { font-size: 13px; color: #c8cfdb; }
  &__hint {
    font-size: 11px;
    color: #6a7382;

    code { background: #1a1f2a; padding: 1px 5px; border-radius: 3px; }
  }

  select, input[type='text'] {
    padding: 9px 12px;
    background: #1a1f2a;
    color: #e6e9ef;
    border: 1px solid #2a3242;
    border-radius: 6px;
    font: inherit;

    &:focus { outline: 1px solid #4fc08d; border-color: #4fc08d; }
  }
}

.admin-scaffold__textarea {
  min-height: 220px;
  padding: 12px;
  background: #1a1f2a;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  resize: vertical;

  &:focus { outline: 1px solid #4fc08d; border-color: #4fc08d; }
}

.admin-scaffold__actions { padding-top: 12px; border-top: 1px solid #232a38; }

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
}

.admin-scaffold__result {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;

  code { background: #1a1f2a; padding: 2px 6px; border-radius: 4px; }

  &--success { background: rgba(79, 192, 141, 0.12); color: #6dd6a3; }
  &--error { background: rgba(255, 132, 120, 0.12); color: #ff8478; }
}
</style>
