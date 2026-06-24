<script setup>
// /admin/menu — 選單管理（header / footer / mobile）
//   - 統一樹編輯：每個項目的 title 為多語系物件 { tw, en, jp, kr }，url / 結構各語系共用
//   - 改繁中文字 → 自動 AI 翻譯其餘啟用語系（AdminMenuNode 內處理）
//   - 排序（上/下移）、新增 / 刪除、＋子層（header 最多三層）
// 資料：server/mock/data/menu.json（磁碟仍存「各語系獨立陣列、依位置對齊」格式，前台讀法不變）。
//   載入：把各語系陣列「zip」成統一樹（title 收成多語系物件）。
//   存檔：把統一樹「拆解」回各語系陣列再寫回。
// dev 模式 db.js 每次請求重讀 → 存檔後站台下次請求即時生效，免重啟。
definePageMeta({ layout: 'admin' })
if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

// 語系設定對照 /admin「啟用語系」（enabledLangs）
const { state: siteState } = useEffectiveSettings()
const ALL_LOCALES = [
  { code: 'tw', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'jp', label: '日本語' },
  { code: 'kr', label: '한국어' },
]
const PRIMARY = 'tw' // 翻譯來源語系（編輯主語系）
// 啟用語系（決定要顯示哪些語系輸入框 + 自動翻譯的目標）
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

const tree = ref(null) // 統一樹：{ header: [node...], footer: [...], mobile: [...] }
const loading = ref(true)
const saving = ref(false)
const dirty = ref(false)
const message = ref(null)

// ── zip：把「各語系同一層的陣列」依位置合併成統一節點（title → 多語系物件）──────
// arraysByLocale: { tw: [...], en: [...], ... }（這一層各語系的項目陣列）
const zipNodes = (arraysByLocale) => {
  // 結構基準語系：取第一個「該層有資料」的語系（通常 tw）
  const baseCode =
    ALL_LOCALES.find((l) => (arraysByLocale[l.code] || []).length)?.code || PRIMARY
  const baseArr = arraysByLocale[baseCode] || []
  return baseArr.map((baseItem, i) => {
    const title = {}
    const childArrays = {}
    for (const l of ALL_LOCALES) {
      const it = (arraysByLocale[l.code] || [])[i]
      title[l.code] = it && it.title != null ? it.title : ''
      childArrays[l.code] = it && Array.isArray(it.children) ? it.children : []
    }
    if (!title[PRIMARY]) title[PRIMARY] = baseItem.title || ''
    return {
      title,
      url: baseItem.url || '/',
      data_type: baseItem.data_type || 'page',
      children: zipNodes(childArrays),
    }
  })
}
// ── 拆解：把統一樹還原成某語系的陣列（title 取該語系，缺則 fallback 繁中）──────
const explodeNodes = (nodes, code) =>
  (nodes || []).map((n) => ({
    title: (n.title && (n.title[code] || n.title[PRIMARY])) || '',
    url: n.url || '/',
    data_type: n.data_type || 'page',
    children: explodeNodes(n.children, code),
  }))

onMounted(async () => {
  try {
    const res = await $fetch('/_admin/mock', { params: { name: 'menu' } })
    const doc = res.parsed || {}
    const t = {}
    for (const { key } of LISTS) {
      const arraysByLocale = {}
      for (const l of ALL_LOCALES) arraysByLocale[l.code] = doc?.[l.code]?.[key] || []
      t[key] = zipNodes(arraysByLocale)
    }
    tree.value = t
  } catch (e) {
    message.value = { type: 'error', text: `讀取 menu.json 失敗：${e.statusMessage || e.message}` }
  } finally {
    loading.value = false
  }
})

const list = (listKey) => tree.value?.[listKey] || []

const touch = () => {
  dirty.value = true
}
// AdminMenuNode 冒泡上來的訊息（翻譯失敗等）；null＝清除
const onNodeMsg = (text) => {
  message.value = text ? { type: 'error', text } : null
}

const onSave = async () => {
  saving.value = true
  message.value = null
  try {
    // 統一樹 → 各語系陣列（所有語系都寫回，停用語系資料一併保留）
    const out = {}
    for (const l of ALL_LOCALES) {
      out[l.code] = {}
      for (const { key } of LISTS) out[l.code][key] = explodeNodes(tree.value[key], l.code)
    }
    await $fetch('/_admin/mock', { method: 'POST', body: { name: 'menu', content: out } })
    dirty.value = false
    // 前台選單以 useFetch（key=site:menu:<lang>）快取 → 存檔後要主動重抓，否則 SPA 切頁仍是舊資料。
    //   refreshNuxtData：更新「本 app」已快取的選單；broadcast：通知其他分頁 / 預覽 iframe 重抓。
    if (import.meta.client) {
      await refreshNuxtData(['site:menu:tw', 'site:menu:en', 'site:menu:jp', 'site:menu:kr'])
      localStorage.setItem('master_v2_menu_broadcast', String(Date.now()))
    }
    message.value = { type: 'success', text: '已寫回 menu.json，前台選單已即時更新（含其他分頁 / 預覽）。' }
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
      編輯 <strong>header / footer / 行動版</strong> 選單：改文字、改路徑、上下排序、新增 / 刪除。
      Header 主選單支援<strong>三層</strong>子選單（每項可「＋子層」往下展開）。
      文字以<strong>繁中</strong>為主，輸入後（失焦）會<strong>自動 AI 翻譯</strong>其餘啟用語系；
      展開「🌐 多語」可逐語系手動覆寫。啟用語系<strong>對照「共用設定 → 啟用語系」</strong>。
    </p>

    <div v-if="loading" class="m-state">讀取中…</div>

    <template v-else-if="tree">
      <!-- 三種清單（header 可三層；footer / mobile 單層） -->
      <section v-for="lst in LISTS" :key="lst.key" class="m-block">
        <h2 class="m-block__h">{{ lst.label }}</h2>
        <AdminMenuNode
          :items="list(lst.key)"
          :max-depth="lst.depth"
          :locales="LOCALES"
          :primary="PRIMARY"
          @touch="touch"
          @msg="onNodeMsg"
        />
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
