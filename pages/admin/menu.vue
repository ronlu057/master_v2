<script setup>
// /admin/menu — 選單管理（header / footer / mobile × 4 語系）
//   - 改文字（title）/ 連結（url）
//   - 排序（上/下移）
//   - 新增 / 刪除項目（header 支援第二層子選單）
// 資料：server/mock/data/menu.json；讀 GET /_admin/mock?name=menu、寫 POST /_admin/mock
// dev 模式 db.js 每次請求重讀 → 存檔後站台下次請求即時生效，免重啟。
definePageMeta({ layout: 'admin' })
if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

// 語系設定對照 /admin「啟用語系」（enabledLangs）；只顯示有啟用的語系分頁
const { state: siteState } = useEffectiveSettings()
const ALL_LOCALES = [
  { code: 'tw', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'jp', label: '日本語' },
  { code: 'kr', label: '한국어' },
]
const LOCALES = computed(() => {
  const enabled =
    Array.isArray(siteState.enabledLangs) && siteState.enabledLangs.length
      ? siteState.enabledLangs
      : ALL_LOCALES.map((l) => l.code)
  return ALL_LOCALES.filter((l) => enabled.includes(l.code))
})
// header 主選單支援三層；footer / mobile 為單層
const LISTS = [
  { key: 'header', label: 'Header 主選單（可三層）', depth: 3 },
  { key: 'footer', label: 'Footer 選單', depth: 1 },
  { key: 'mobile', label: '行動版選單', depth: 1 },
]

const doc = ref(null) // 完整 menu.json（各語系）
const loading = ref(true)
const saving = ref(false)
const dirty = ref(false)
const message = ref(null)
const locale = ref('tw')

onMounted(async () => {
  try {
    const res = await $fetch('/_admin/mock', { params: { name: 'menu' } })
    doc.value = res.parsed || {}
    // 補齊「所有」語系 / 各清單結構（即使停用也保留資料，避免丟失）
    for (const { code } of ALL_LOCALES) {
      doc.value[code] = doc.value[code] || {}
      for (const { key } of LISTS) doc.value[code][key] = doc.value[code][key] || []
    }
    // 目前語系若不在啟用清單 → 切到第一個啟用語系
    if (!LOCALES.value.find((l) => l.code === locale.value)) {
      locale.value = LOCALES.value[0]?.code || 'tw'
    }
  } catch (e) {
    message.value = { type: 'error', text: `讀取 menu.json 失敗：${e.statusMessage || e.message}` }
  } finally {
    loading.value = false
  }
})

const list = (listKey) => doc.value?.[locale.value]?.[listKey] || []

const touch = () => {
  dirty.value = true
}

const onSave = async () => {
  saving.value = true
  message.value = null
  try {
    await $fetch('/_admin/mock', { method: 'POST', body: { name: 'menu', content: doc.value } })
    dirty.value = false
    message.value = { type: 'success', text: '已寫回 menu.json，站台下次請求即時生效（dev 免重啟）。' }
  } catch (e) {
    message.value = { type: 'error', text: `寫入失敗：${e.statusMessage || e.message}` }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page__title">選單管理</h1>
    <p class="page__desc">
      編輯 <strong>header / footer / 行動版</strong> 選單：改文字、改連結、上下排序、新增 / 刪除。
      Header 主選單支援<strong>三層</strong>子選單（每項可「＋子層」往下展開）。
      語系分頁<strong>對照「共用設定 → 啟用語系」</strong>，只列出有啟用的語系，各自獨立編輯。
    </p>

    <div v-if="loading" class="m-state">讀取中…</div>

    <template v-else-if="doc">
      <!-- 語系切換 -->
      <div class="m-tabs">
        <button
          v-for="l in LOCALES"
          :key="l.code"
          type="button"
          :class="['m-tab', { 'is-on': locale === l.code }]"
          @click="locale = l.code"
        >
          {{ l.label }}
        </button>
      </div>

      <!-- 三種清單（header 可三層；footer / mobile 單層） -->
      <section v-for="lst in LISTS" :key="lst.key" class="m-block">
        <h2 class="m-block__h">{{ lst.label }}</h2>
        <AdminMenuNode :items="list(lst.key)" :max-depth="lst.depth" @touch="touch" />
      </section>

      <div class="m-actions">
        <button type="button" class="m-save" :disabled="!dirty || saving" @click="onSave">
          {{ saving ? '寫入中…' : dirty ? '送出寫回 menu.json' : '無變動' }}
        </button>
      </div>
    </template>

    <p v-if="message" :class="['msg', `msg--${message.type}`]">{{ message.text }}</p>
  </div>
</template>

<style lang="scss" scoped>
.page__title {
  font-size: 22px;
  margin-bottom: 8px;
}
.page__desc {
  color: #7a8896;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.6;
}
.m-state {
  color: #7a8896;
  font-size: 14px;
}

.m-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}
.m-tab {
  padding: 6px 16px;
  font-size: 13px;
  background: #0f1218;
  color: #8a93a3;
  border: 1px solid #2a3242;
  border-radius: 6px;
  cursor: pointer;

  &.is-on {
    background: rgba(79, 192, 141, 0.14);
    border-color: #2a4a3a;
    color: #6dd6a3;
    font-weight: 600;
  }
}

.m-block {
  margin-bottom: 24px;

  &__h {
    font-size: 14px;
    color: #c8cfdb;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #232a38;
  }
}

.m-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.m-item {
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;
  padding: 8px;
}

.m-row {
  display: flex;
  align-items: center;
  gap: 8px;

  &--child {
    margin-top: 8px;
    padding-left: 16px;
  }
}

.m-ord {
  display: flex;
  flex-direction: column;
  gap: 2px;

  button {
    width: 22px;
    height: 16px;
    font-size: 9px;
    line-height: 1;
    background: #0f1218;
    color: #8a93a3;
    border: 1px solid #2a3242;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      color: #6dd6a3;
      border-color: #2a4a3a;
    }
  }
}

.m-in {
  padding: 6px 10px;
  background: #0f1218;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font-size: 13px;

  &--title {
    flex: 1;
    min-width: 0;
  }
  &--url {
    flex: 1;
    min-width: 0;
    color: #8a93a3;
  }
  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
}

.m-children {
  border-top: 1px dashed #232a38;
  margin-top: 8px;
  padding-top: 4px;
}

.m-btn {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #2a3242;
  background: #0f1218;
  color: #c8cfdb;
  cursor: pointer;
  white-space: nowrap;

  &--ghost:hover {
    color: #6dd6a3;
    border-color: #2a4a3a;
  }
  &--del {
    color: #d98a8a;
    &:hover {
      background: #2a1a1a;
      border-color: #4a2a2a;
    }
  }
}

.m-add {
  align-self: flex-start;
  margin-top: 2px;
  padding: 7px 14px;
  font-size: 13px;
  background: #0f1218;
  color: #6dd6a3;
  border: 1px dashed #2a4a3a;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #14241d;
  }
}

.m-actions {
  margin-top: 8px;
}
.m-save {
  padding: 10px 20px;
  font-size: 14px;
  background: #4fc08d;
  color: #0f1218;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.msg {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;

  &--success {
    background: rgba(79, 192, 141, 0.12);
    color: #6dd6a3;
  }
  &--error {
    background: rgba(217, 138, 138, 0.12);
    color: #e0a0a0;
  }
}
</style>
