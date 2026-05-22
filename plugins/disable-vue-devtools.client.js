// 停用 Vue DevTools 連線
// ──────────────────────────────────────────────────────────
// 用途：避免開發時跳出「"xxx" store installed」等 Vue DevTools 提示框。
// 作法：在 app 啟動early階段把 Vue DevTools 的全域 hook 設為無效，
//       讓 Pinia / Vue 發出的事件不會送到 DevTools（含瀏覽器擴充套件）。
// 注意：這會讓 Vue DevTools 無法偵錯本專案。若日後需要用，刪除此檔即可。
export default defineNuxtPlugin({
  name: 'disable-vue-devtools',
  enforce: 'pre',
  setup() {
    try {
      const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
      if (hook) {
        const noop = () => {}
        hook.enabled = false
        hook.emit = noop
        hook.on = noop
        hook.once = noop
        hook.off = noop
      }
    } catch {
      // 忽略
    }
  },
})
