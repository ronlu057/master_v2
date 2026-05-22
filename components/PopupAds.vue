<script setup>
// 彈跳廣告（白皮書 §12.4）— 進站顯示，localStorage 記錄已關閉者
const { isMinimal } = useProject()
const { data: ads } = useApiData('/popupsAd/list', { key: 'popups', default: () => [] })

const current = ref(null)
const STORAGE = 'popup_dismissed'

onMounted(() => {
  if (isMinimal) return
  let dismissed = []
  try {
    dismissed = JSON.parse(localStorage.getItem(STORAGE) || '[]')
  } catch {
    dismissed = []
  }
  current.value = (ads.value || []).find((a) => !dismissed.includes(a.id)) || null
})

function close() {
  if (current.value) {
    let dismissed = []
    try {
      dismissed = JSON.parse(localStorage.getItem(STORAGE) || '[]')
    } catch {
      dismissed = []
    }
    dismissed.push(current.value.id)
    localStorage.setItem(STORAGE, JSON.stringify(dismissed))
  }
  current.value = null
}

const link = computed(() => {
  const t = current.value?.target
  return t && t.type === 'internal' ? t.value : null
})
</script>

<template>
  <transition name="fade">
    <div v-if="current" class="popup" @click.self="close">
      <div class="popup__box">
        <button class="popup__close" aria-label="關閉" @click="close">✕</button>
        <component
          :is="link ? 'NuxtLink' : 'div'"
          :to="link || undefined"
          @click="link && close()"
        >
          <img :src="current.image" :alt="current.title" class="popup__img" />
        </component>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.popup {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.6);

  &__box {
    position: relative;
    max-width: 420px;
    width: 100%;
  }

  &__close {
    position: absolute;
    top: -14px;
    right: -14px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #fff;
    box-shadow: var(--shadow);
    font-size: 16px;
  }

  &__img {
    width: 100%;
    border-radius: var(--radius-lg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
