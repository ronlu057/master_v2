<script setup>
// 後台背景圖裁切器（互動式）— 拖曳調整比例固定的裁切框，輸出固定寬度（高度按比例）的圖。
// 註：裁切框的 left/top/width/height 為「執行期幾何值」，依製作規範 §3.1.2 屬 :style 合法例外。
const props = defineProps({
  file: { type: Object, required: true }, // 使用者選的 File
  ratio: { type: Number, default: 1920 / 911 }, // 裁切比例（寬/高）
  outWidth: { type: Number, default: 2560 }, // 輸出寬度（高度 = outWidth / ratio）
})
const emit = defineEmits(['confirm', 'cancel'])

const imgUrl = ref('')
const imgRef = ref(null)
const dispW = ref(0) // 圖片實際顯示寬（px）
const dispH = ref(0)
const box = reactive({ x: 0, y: 0, w: 0, h: 0 }) // 裁切框（顯示座標）

const outHeight = computed(() => Math.round(props.outWidth / props.ratio))

onMounted(() => {
  imgUrl.value = URL.createObjectURL(props.file)
  window.addEventListener('resize', relayout)
})
onBeforeUnmount(() => {
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
  window.removeEventListener('resize', relayout)
  stopDrag()
})

const relayout = () => {
  const el = imgRef.value
  if (!el || !el.clientWidth) return
  dispW.value = el.clientWidth
  dispH.value = el.clientHeight
  // 初始裁切框 = 圖內最大置中、比例固定
  let w = dispW.value
  let h = w / props.ratio
  if (h > dispH.value) {
    h = dispH.value
    w = h * props.ratio
  }
  box.w = w
  box.h = h
  box.x = (dispW.value - w) / 2
  box.y = (dispH.value - h) / 2
}

// ── 拖曳（move / resize）；用 pointer 事件同時支援滑鼠與觸控 ──
let drag = null
const onMove = (e) => {
  if (!drag) return
  if (drag.mode === 'move') {
    const nx = drag.bx + (e.clientX - drag.sx)
    const ny = drag.by + (e.clientY - drag.sy)
    box.x = Math.max(0, Math.min(nx, dispW.value - box.w))
    box.y = Math.max(0, Math.min(ny, dispH.value - box.h))
  } else {
    let nw = Math.max(48, drag.bw + (e.clientX - drag.sx))
    nw = Math.min(nw, dispW.value - box.x)
    let nh = nw / props.ratio
    if (nh > dispH.value - box.y) {
      nh = dispH.value - box.y
      nw = nh * props.ratio
    }
    box.w = nw
    box.h = nh
  }
}
const stopDrag = () => {
  drag = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', stopDrag)
}
const startMove = (e) => {
  drag = { mode: 'move', sx: e.clientX, sy: e.clientY, bx: box.x, by: box.y }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', stopDrag)
}
const startResize = (e) => {
  e.stopPropagation()
  drag = { mode: 'resize', sx: e.clientX, sy: e.clientY, bw: box.w }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', stopDrag)
}

const apply = () => {
  const el = imgRef.value
  const scale = el.naturalWidth / dispW.value // 顯示 → 原圖
  const sx = Math.round(box.x * scale)
  const sy = Math.round(box.y * scale)
  const sw = Math.round(box.w * scale)
  const sh = Math.round(box.h * scale)
  const canvas = document.createElement('canvas')
  canvas.width = props.outWidth
  canvas.height = outHeight.value
  canvas.getContext('2d').drawImage(el, sx, sy, sw, sh, 0, 0, props.outWidth, outHeight.value)
  const mime = props.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  canvas.toBlob((blob) => emit('confirm', blob), mime, 0.92)
}
</script>

<template>
  <div class="cropper" @pointerdown.self="$emit('cancel')">
    <div class="cropper__panel">
      <p class="cropper__hint">
        拖曳裁切框移動、右下角控制點縮放（比例固定）。輸出 <b>{{ outWidth }}×{{ outHeight }}</b>
      </p>
      <div class="cropper__stage">
        <img ref="imgRef" :src="imgUrl" class="cropper__img" alt="" @load="relayout" />
        <div
          class="cropper__box"
          :style="{ left: box.x + 'px', top: box.y + 'px', width: box.w + 'px', height: box.h + 'px' }"
          @pointerdown="startMove"
        >
          <span class="cropper__handle" @pointerdown="startResize"></span>
        </div>
      </div>
      <div class="cropper__ops">
        <button type="button" class="btn btn--ghost" @click="$emit('cancel')">取消</button>
        <button type="button" class="btn btn--primary" @click="apply">套用裁切</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cropper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
}
.cropper__panel {
  background: #161b24;
  border: 1px solid #2a3242;
  border-radius: 10px;
  padding: 16px;
  max-width: 92vw;
}
.cropper__hint {
  color: #c8cfdb;
  font-size: 13px;
  margin-bottom: 10px;

  b {
    color: #6fd08c;
  }
}
.cropper__stage {
  position: relative;
  display: inline-block;
  line-height: 0;
  user-select: none;
  touch-action: none;
}
.cropper__img {
  display: block;
  max-width: 84vw;
  max-height: 64vh;
}
.cropper__box {
  position: absolute;
  border: 2px solid #4fc08d;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); // 框外變暗
  cursor: move;
  touch-action: none;
}
.cropper__handle {
  position: absolute;
  right: -8px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: #4fc08d;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: nwse-resize;
  touch-action: none;
}
.cropper__ops {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}
</style>
