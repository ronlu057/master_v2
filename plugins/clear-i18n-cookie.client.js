// 清除 @nuxtjs/i18n 殘留 cookie，避免「URL 訪問被 cookie 干擾」
// 配合 nuxt.config.js 的 detectBrowserLanguage: false 一起用
// 之後即使換電腦、換瀏覽器，URL 永遠是唯一來源
const COOKIE_NAMES = ['i18n_lang', 'i18n_redirected']

export default defineNuxtPlugin(() => {
  for (const name of COOKIE_NAMES) {
    // 用過期日期清除（多種 path 寫法都清一遍，避免 cookie 被卡在不同 path）
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${location.hostname}`
  }
})
