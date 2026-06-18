<script setup>
// /admin/menu — 選單管理（header / footer / mobile × 4 語系）
//   - 改文字（title）/ 連結（url）
//   - 排序（上/下移）
//   - 新增 / 刪除項目（header 支援第二層子選單）
// 資料：server/mock/data/menu.json；讀 GET /_admin/mock?name=menu、寫 POST /_admin/mock
// dev 模式 db.js 每次請求重讀 → 存檔後站台下次請求即時生效，免重啟。
definePageMeta({ layout: 'admin' })
if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const LOCALES = [
  { code: 'tw', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'jp', label: '日本語' },
  { code: 'kr', label: '한국어' },
]
const LISTS = [
  { key: 'header', label: 'Header 主選單', children: true },
  { key: 'footer', label: 'Footer 選單', children: false },
  { key: 'mobile', label: '行動版選單', children: false },
]

const doc = ref(null) // 完整 menu.json（4 語系）
const loading = ref(true)
const saving = ref(false)
const dirty = ref(false)
const message = ref(null)
const locale = ref('tw')

onMounted(async () => {
  try {
    const res = await $fetch('/_admin/mock', { params: { name: 'menu' } })
    doc.value = res.parsed || {}
    // 補齊各語系 / 各清單結構，避免 undefined
    for (const { code } of LOCALES) {
      doc.value[code] = doc.value[code] || {}
      for (const { key } of LISTS) doc.value[code][key] = doc.value[code][key] || []
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
const move = (arr, i, dir) => {
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  touch()
}
const remove = (arr, i) => {
  arr.splice(i, 1)
  touch()
}
const addItem = (arr) => {
  arr.push({ title: '新項目', url: '/', data_type: 'page', children: [] })
  touch()
}
const addChild = (item) => {
  item.children = item.children || []
  item.children.push({ title: '新子項目', url: '/', data_type: 'page', children: [] })
  touch()
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
      Header 主選單支援第二層子選單。每個語系獨立 — 上方切換語系分別編輯。
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

      <!-- 三種清單 -->
      <section v-for="lst in LISTS" :key="lst.key" class="m-block">
        <h2 class="m-block__h">{{ lst.label }}</h2>

        <div class="m-list">
          <div v-for="(item, i) in list(lst.key)" :key="i" class="m-item">
            <div class="m-row">
              <div class="m-ord">
                <button type="button" :disabled="i === 0" @click="move(list(lst.key), i, -1)">▲</button>
                <button
                  type="button"
                  :disabled="i === list(lst.key).length - 1"
                  @click="move(list(lst.key), i, 1)"
                >
                  ▼
                </button>
              </div>
              <input v-model="item.title" class="m-in m-in--title" placeholder="顯示文字" @input="touch" />
              <input v-model="item.url" class="m-in m-in--url" placeholder="/連結" @input="touch" />
              <button
                v-if="lst.children"
                type="button"
                class="m-btn m-btn--ghost"
                @click="addChild(item)"
              >
                ＋子項
              </button>
              <button type="button" class="m-btn m-btn--del" @click="remove(list(lst.key), i)">刪除</button>
            </div>

            <!-- 第二層子選單（僅 header） -->
            <div v-if="lst.children && item.children && item.children.length" class="m-children">
              <div v-for="(c, j) in item.children" :key="j" class="m-row m-row--child">
                <div class="m-ord">
                  <button type="button" :disabled="j === 0" @click="move(item.children, j, -1)">▲</button>
                  <button
                    type="button"
                    :disabled="j === item.children.length - 1"
                    @click="move(item.children, j, 1)"
                  >
                    ▼
                  </button>
                </div>
                <input v-model="c.title" class="m-in m-in--title" placeholder="子選單文字" @input="touch" />
                <input v-model="c.url" class="m-in m-in--url" placeholder="/連結" @input="touch" />
                <button type="button" class="m-btn m-btn--del" @click="remove(item.children, j)">刪除</button>
              </div>
            </div>
          </div>

          <button type="button" class="m-add" @click="addItem(list(lst.key))">＋ 新增項目</button>
        </div>
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
