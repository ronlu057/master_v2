// UI 狀態 — 行動版選單開關（白皮書 §4.2 Setup Store 風格）
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const menuOpen = ref(false)

  function toggleMenu() {
    menuOpen.value = !menuOpen.value
  }
  function closeMenu() {
    menuOpen.value = false
  }

  return { menuOpen, toggleMenu, closeMenu }
})
