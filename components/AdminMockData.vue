<script setup>
// /admin Mock 資料 tab
// 左側列出 server/mock/data/*.json，右側 textarea 編輯
// 儲存：POST /_admin/mock，需要重啟 dev server 才會生效（mock 系統 cache 在 db.js）

const files = ref([])
const selectedName = ref(null)
const raw = ref('')
const initial = ref('')

const loading = ref(false)
const saving = ref(false)
const message = ref(null)
const parseError = ref(null)

const loadList = async () => {
  const res = await $fetch('/_admin/mock')
  files.value = res.files
  if (!selectedName.value && files.value.length) {
    await pick(files.value[0].name)
  }
}

const pick = async (name) => {
  selectedName.value = name
  loading.value = true
  message.value = null
  parseError.value = null
  try {
    const res = await $fetch('/_admin/mock', { query: { name } })
    raw.value = res.raw
    initial.value = res.raw
    if (res.parseError) parseError.value = `原檔 JSON 解析失敗：${res.parseError}`
  } finally {
    loading.value = false
  }
}

const dirty = computed(() => raw.value !== initial.value)

// 即時驗證 JSON 語法
const liveParseError = computed(() => {
  if (!raw.value.trim()) return null
  try { JSON.parse(raw.value); return null }
  catch (e) { return e.message }
})

const save = async () => {
  if (liveParseError.value) {
    message.value = { type: 'error', text: `JSON 語法錯誤，請先修正：${liveParseError.value}` }
    return
  }
  saving.value = true
  message.value = null
  try {
    await $fetch('/_admin/mock', {
      method: 'POST',
      body: { name: selectedName.value, content: raw.value },
    })
    initial.value = raw.value
    message.value = { type: 'success', text: '已寫回。重新整理站台或下次 API 請求就會看到新值。' }
    await loadList() // 更新檔案大小/時間
  } catch (e) {
    message.value = { type: 'error', text: e.statusMessage || e.message }
  } finally {
    saving.value = false
  }
}

const formatJson = () => {
  try {
    raw.value = JSON.stringify(JSON.parse(raw.value), null, 2)
  } catch (e) {
    message.value = { type: 'error', text: `無法格式化：${e.message}` }
  }
}

onMounted(loadList)
</script>

<template>
  <div class="admin-mock">
    <h2 class="admin-mock__title">Mock 資料編輯</h2>
    <p class="admin-mock__desc">
      編輯 <code>server/mock/data/*.json</code>。儲存後下次 API 請求立即生效，無需重啟 dev server。
    </p>

    <div class="admin-mock__layout">
      <aside class="admin-mock__list">
        <button
          v-for="f in files"
          :key="f.name"
          type="button"
          :class="['admin-mock__file', { 'is-active': selectedName === f.name }]"
          @click="pick(f.name)"
        >
          <span class="admin-mock__file-name">{{ f.name }}.json</span>
          <span class="admin-mock__file-size">{{ Math.round(f.size / 1024 * 10) / 10 }} KB</span>
        </button>
      </aside>

      <section class="admin-mock__editor">
        <div v-if="loading" class="admin-mock__loading">載入中…</div>
        <template v-else-if="selectedName">
          <div class="admin-mock__toolbar">
            <span class="admin-mock__current">{{ selectedName }}.json</span>
            <span v-if="liveParseError" class="admin-mock__syntax-error">
              ⚠ {{ liveParseError }}
            </span>
            <button type="button" class="btn btn--ghost btn--sm" @click="formatJson">
              格式化
            </button>
            <button
              type="button"
              class="btn btn--primary btn--sm"
              :disabled="!dirty || saving || !!liveParseError"
              @click="save"
            >
              {{ saving ? '寫入中…' : dirty ? '儲存' : '無變動' }}
            </button>
          </div>

          <p v-if="parseError" class="admin-mock__warning">{{ parseError }}</p>

          <textarea
            v-model="raw"
            class="admin-mock__textarea"
            spellcheck="false"
            autocomplete="off"
          ></textarea>

          <p
            v-if="message"
            :class="['admin-mock__message', `admin-mock__message--${message.type}`]"
          >
            {{ message.text }}
          </p>
        </template>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-mock__title { font-size: 22px; margin-bottom: 8px; }
.admin-mock__desc {
  color: #7a8896;
  font-size: 14px;
  margin-bottom: 20px;

  code { background: #1a1f2a; padding: 2px 6px; border-radius: 4px; color: #c8cfdb; }
}

.admin-mock__layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  min-height: 60vh;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.admin-mock__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #161b25;
  border: 1px solid #232a38;
  border-radius: 8px;
  padding: 8px;
  max-height: 70vh;
  overflow-y: auto;
}

.admin-mock__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #c8cfdb;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;

  &:hover { background: #1f2532; }
  &.is-active {
    background: #4fc08d;
    color: #0f1218;
    font-weight: 600;
  }
}

.admin-mock__file-size {
  font-size: 10px;
  opacity: 0.7;
}

.admin-mock__editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-mock__loading { color: #7a8896; padding: 20px; }

.admin-mock__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-mock__current { font-weight: 600; font-size: 14px; }

.admin-mock__syntax-error {
  color: #ff8478;
  font-size: 12px;
  margin-right: auto;
}

.admin-mock__warning {
  background: rgba(255, 132, 120, 0.1);
  color: #ff8478;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.admin-mock__textarea {
  flex: 1;
  min-height: 50vh;
  padding: 12px;
  background: #1a1f2a;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;

  &:focus { outline: 1px solid #4fc08d; border-color: #4fc08d; }
}

.admin-mock__message {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;

  &--success { background: rgba(79, 192, 141, 0.12); color: #6dd6a3; }
  &--error { background: rgba(255, 132, 120, 0.12); color: #ff8478; }
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  margin-left: auto;

  &--primary {
    background: #4fc08d;
    color: #0f1218;
    font-weight: 600;
    margin-left: 0;

    &:hover:not(:disabled) { background: #6dd6a3; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--ghost {
    background: transparent;
    color: #c8cfdb;
    border-color: #2a3242;
    margin-left: auto;

    &:hover { background: #1f2532; }
  }

  &--sm { padding: 6px 12px; }
}
</style>
