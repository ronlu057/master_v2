// 購物車狀態 — 購物類型專案使用（白皮書 §4.2 Setup Store 風格）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 每筆：{ id, blink, title, price, image, qty }
  const items = ref([])

  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))

  function add(product, qty = 1) {
    const found = items.value.find((i) => i.id === product.id)
    if (found) {
      found.qty += qty
    } else {
      items.value.push({
        id: product.id,
        blink: product.blink,
        title: product.title,
        price: product.price,
        image: product.image,
        qty,
      })
    }
  }

  function setQty(id, qty) {
    const found = items.value.find((i) => i.id === id)
    if (found) found.qty = Math.max(1, qty)
  }

  function remove(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, count, total, add, setQty, remove, clear }
})
