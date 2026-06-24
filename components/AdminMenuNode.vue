<script setup>
// 遞迴選單編輯節點（給 /admin/menu 用）— 支援多層（由 maxDepth 限制，預設 3 層）。
// 每個節點的 title 為「多語系物件」{ tw, en, jp, kr }，url / 結構各語系共用。
// 直接操作傳入的 items（與 tree 同一參考）→ 改動即時反映；改動後 emit('touch')。
// 改「繁中(primary)」文字（失焦/Enter）會自動 AI 翻譯其餘啟用語系（Gemini，dev-only）。
const props = defineProps({
  items: { type: Array, required: true },
  depth: { type: Number, default: 1 },
  maxDepth: { type: Number, default: 3 },
  // 啟用語系清單 [{ code, label }]（對照共用設定 → 啟用語系）
  locales: { type: Array, default: () => [] },
  // 主要語系（翻譯來源；其餘語系由此翻出）
  primary: { type: String, default: 'tw' },
  // 這一層所有項目的「父路徑」（用來自動生成新增子層的路徑＝父路徑 + / + 英文 slug）
  parentUrl: { type: String, default: '' },
})
const emit = defineEmits(['touch', 'msg'])

const touch = () => emit('touch')

// 主要語系以外的目標語系（要顯示輸入框 + 自動翻譯的對象）
const otherLangs = computed(() => props.locales.filter((l) => l.code !== props.primary))

// 以「節點物件」為 key 的暫時狀態（reactive Set，跨排序仍穩定）
const expanded = reactive(new Set()) // 哪些節點展開「其他語系」
const translating = reactive(new Set()) // 哪些節點翻譯中
const toggleExpand = (item) => (expanded.has(item) ? expanded.delete(item) : expanded.add(item))

// 生成一份新標題（多語系）：每個啟用語系給空字串，主要語系帶入預設文字（可改）
const makeTitle = (text) => {
  const t = {}
  for (const l of props.locales) t[l.code] = ''
  t[props.primary] = text
  return t
}
// 英文 → 路徑 slug（小寫、非英數轉 -、去頭尾 -）
const slugify = (s) =>
  (s || '').toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
// 父路徑 + / + 末段（去掉父路徑尾斜線）
const joinPath = (base, seg) => (base || '').replace(/\/+$/, '') + '/' + (seg || 'new')
// 生成新節點：可改的預設文字 + 路徑（路徑先帶「父路徑/new」佔位，翻譯後自動換成英文 slug）
// _auto：標記「路徑由系統自動生成」；使用者一旦手動改 url 就清掉，之後不再覆寫。
//   （_auto 不會被存進 menu.json — menu.vue explode 只取 title/url/data_type/children）
const makeNode = (text, base) => ({
  title: makeTitle(text),
  url: joinPath(base, 'new'),
  data_type: 'page',
  children: [],
  _auto: true,
})

const move = (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= props.items.length) return
  const a = props.items
  ;[a[i], a[j]] = [a[j], a[i]]
  touch()
}
const removeItem = (i) => {
  props.items.splice(i, 1)
  touch()
}
const addItem = () => {
  // 同一層新增 → 父路徑＝本層的 parentUrl
  props.items.push(makeNode(props.depth === 1 ? '新項目' : '新子項目', props.parentUrl))
  touch()
}
const addChild = (item) => {
  item.children = item.children || []
  // 往 item 底下加子層 → 父路徑＝item 自己的 url
  item.children.push(makeNode('新子項目', item.url))
  expanded.add(item) // 加子層時順手展開父層的多語區，方便對照
  touch()
}
// 使用者手動改路徑 → 取消自動生成
const onUrlInput = (item) => {
  item._auto = false
  touch()
}
// 編輯路徑前記住舊值（給「父路徑連動子層」用）；transient，不存檔
const urlBeforeEdit = new Map()
const onUrlFocus = (item) => urlBeforeEdit.set(item, item.url)
// 把子孫層中「開頭是舊父路徑」的 url 前綴一起換成新父路徑（手動改別的前綴 / 不符前綴者不動）
const cascadePrefix = (nodes, oldBase, newBase) => {
  if (!Array.isArray(nodes)) return
  for (const n of nodes) {
    if (typeof n.url === 'string' && (n.url === oldBase || n.url.startsWith(oldBase + '/'))) {
      n.url = newBase + n.url.slice(oldBase.length)
    }
    cascadePrefix(n.children, oldBase, newBase)
  }
}
// 路徑改完（失焦/Enter）→ 連動子層
const onUrlChange = (item) => {
  const oldUrl = urlBeforeEdit.get(item)
  urlBeforeEdit.delete(item)
  const newUrl = item.url
  if (oldUrl && newUrl && oldUrl !== newUrl) {
    cascadePrefix(item.children, oldUrl, newUrl)
    touch()
  }
}

// 改主要語系 → 自動翻譯其餘啟用語系
const autoTranslate = async (item) => {
  const text = (item.title?.[props.primary] ?? '').toString().trim()
  const targets = otherLangs.value.map((l) => l.code)
  if (!text || !targets.length) return
  if (translating.has(item)) return
  translating.add(item)
  emit('msg', null)
  try {
    const res = await $fetch('/_admin/ai-translate', {
      method: 'POST',
      body: { text, source: props.primary, targets },
    })
    const tr = res?.translations || {}
    if (!item.title || typeof item.title !== 'object') item.title = {}
    for (const code of targets) if (tr[code]) item.title[code] = tr[code]
    // 自動路徑：新增的節點用英文翻譯生成 路徑＝父路徑 + / + 英文 slug
    // （使用者改過 url（_auto=false）就不再覆寫；無英文翻譯時維持原佔位）
    if (item._auto) {
      const slug = slugify(item.title.en || item.title[props.primary])
      if (slug) item.url = joinPath(props.parentUrl, slug)
    }
    touch()
  } catch (e) {
    emit('msg', `自動翻譯失敗：${e?.data?.message || e?.statusMessage || e?.message || '未知錯誤'}`)
  } finally {
    translating.delete(item)
  }
}
const onPrimaryChange = (item) => {
  if (otherLangs.value.length) autoTranslate(item)
}
</script>

<template>
  <div class="mne" :class="`mne--d${depth}`">
    <div v-for="(item, i) in items" :key="i" class="mne__item">
      <div class="mne__row">
        <span class="mne__depth">L{{ depth }}</span>
        <div class="mne__ord">
          <button type="button" :disabled="i === 0" @click="move(i, -1)">▲</button>
          <button type="button" :disabled="i === items.length - 1" @click="move(i, 1)">▼</button>
        </div>
        <input
          v-model="item.title[primary]"
          class="mne__in mne__in--title"
          placeholder="顯示文字（繁中）"
          @input="touch"
          @change="onPrimaryChange(item)"
        />
        <input
          v-model="item.url"
          class="mne__in mne__in--url"
          placeholder="/路徑"
          @focus="onUrlFocus(item)"
          @input="onUrlInput(item)"
          @change="onUrlChange(item)"
        />
        <button
          v-if="otherLangs.length"
          type="button"
          class="mne__btn mne__btn--lang"
          :class="{ 'is-on': expanded.has(item) }"
          @click="toggleExpand(item)"
        >
          🌐 多語<span v-if="translating.has(item)" class="mne__dot">翻譯中…</span>
        </button>
        <button
          v-if="depth < maxDepth"
          type="button"
          class="mne__btn mne__btn--ghost"
          @click="addChild(item)"
        >
          ＋子層
        </button>
        <button type="button" class="mne__btn mne__btn--del" @click="removeItem(i)">刪除</button>
      </div>

      <!-- 其他語系標題（改繁中自動翻譯；可手動覆寫） -->
      <div v-if="otherLangs.length && expanded.has(item)" class="mne__langs">
        <div class="mne__langs-head">
          <span>其他語系標題 — 改繁中會自動翻譯，亦可手動覆寫</span>
          <button
            type="button"
            class="mne__btn mne__btn--ghost mne__btn--xs"
            :disabled="translating.has(item)"
            @click="autoTranslate(item)"
          >
            {{ translating.has(item) ? '翻譯中…' : '↻ 重新翻譯' }}
          </button>
        </div>
        <div v-for="l in otherLangs" :key="l.code" class="mne__lang-row">
          <span class="mne__lang-code">{{ l.label }}</span>
          <input
            v-model="item.title[l.code]"
            class="mne__in"
            :disabled="translating.has(item)"
            placeholder="留空＝沿用繁中"
            @input="touch"
          />
        </div>
      </div>

      <!-- 下一層（遞迴，受 maxDepth 限制） -->
      <div
        v-if="depth < maxDepth && item.children && item.children.length"
        class="mne__children"
      >
        <AdminMenuNode
          :items="item.children"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :locales="locales"
          :primary="primary"
          :parent-url="item.url"
          @touch="touch"
          @msg="(m) => emit('msg', m)"
        />
      </div>
    </div>

    <button type="button" class="mne__add" @click="addItem">
      ＋ 新增{{ depth === 1 ? '項目' : `第 ${depth} 層` }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.mne {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
// 子層縮排 + 左側階層線
.mne--d2,
.mne--d3 {
  margin-top: 8px;
  padding-left: 14px;
  border-left: 2px solid #2a3242;
}

.mne__item {
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;
  padding: 8px;
}
.mne--d2 .mne__item {
  background: #161b25;
}
.mne--d3 .mne__item {
  background: #12161f;
}

.mne__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mne__depth {
  flex-shrink: 0;
  width: 20px;
  font-size: 10px;
  color: #6a7382;
  text-align: center;
}

.mne__ord {
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

.mne__in {
  padding: 6px 10px;
  background: #0f1218;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font-size: 13px;

  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
}
.mne__in--title {
  flex: 1;
  min-width: 0;
}
.mne__in--url {
  flex: 1;
  min-width: 0;
  color: #8a93a3;
}

// 其他語系標題區
.mne__langs {
  margin-top: 8px;
  padding: 8px 10px;
  background: #0f1218;
  border: 1px dashed #2a3242;
  border-radius: 6px;
}
.mne__langs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
  color: #6a7382;
}
.mne__lang-row {
  display: flex;
  align-items: center;
  gap: 8px;

  & + & {
    margin-top: 6px;
  }
}
.mne__lang-code {
  flex-shrink: 0;
  width: 40px;
  font-size: 12px;
  color: #8a93a3;
}
.mne__lang-row .mne__in {
  flex: 1;
  min-width: 0;
}

.mne__children {
  margin-top: 4px;
}

.mne__dot {
  margin-left: 4px;
  font-size: 10px;
  color: #d4b170;
}

.mne__btn {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #2a3242;
  background: #0f1218;
  color: #c8cfdb;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.mne__btn--xs {
  padding: 3px 8px;
  font-size: 11px;
}
.mne__btn--lang {
  color: #8a93a3;

  &.is-on,
  &:hover {
    color: #6dd6a3;
    border-color: #2a4a3a;
  }
}
.mne__btn--ghost:hover {
  color: #6dd6a3;
  border-color: #2a4a3a;
}
.mne__btn--del {
  color: #d98a8a;

  &:hover {
    background: #2a1a1a;
    border-color: #4a2a2a;
  }
}

.mne__add {
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
</style>
