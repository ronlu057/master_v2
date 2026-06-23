<script setup>
// 遞迴選單編輯節點（給 /admin/menu 用）— 支援多層（由 maxDepth 限制，預設 3 層）。
// 直接操作傳入的 items 陣列（與 menu.json 同一參考）→ 改動即時反映到 doc；改動後 emit('touch')。
const props = defineProps({
  items: { type: Array, required: true },
  depth: { type: Number, default: 1 },
  maxDepth: { type: Number, default: 3 },
})
const emit = defineEmits(['touch'])

const touch = () => emit('touch')

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
  props.items.push({
    title: props.depth === 1 ? '新項目' : '新子項目',
    url: '/',
    data_type: 'page',
    children: [],
  })
  touch()
}
const addChild = (item) => {
  item.children = item.children || []
  item.children.push({ title: '新子項目', url: '/', data_type: 'page', children: [] })
  touch()
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
          v-model="item.title"
          class="mne__in mne__in--title"
          placeholder="顯示文字"
          @input="touch"
        />
        <input
          v-model="item.url"
          class="mne__in mne__in--url"
          placeholder="/連結"
          @input="touch"
        />
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

      <!-- 下一層（遞迴，受 maxDepth 限制） -->
      <div
        v-if="depth < maxDepth && item.children && item.children.length"
        class="mne__children"
      >
        <AdminMenuNode
          :items="item.children"
          :depth="depth + 1"
          :max-depth="maxDepth"
          @touch="touch"
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

.mne__children {
  margin-top: 4px;
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
