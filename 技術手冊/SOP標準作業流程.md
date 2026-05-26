# SOP 標準作業流程

> 配合 [開發母版專案.md](./開發母版專案.md) 使用。本檔講「**怎麼做**」具體步驟；白皮書講「**為什麼這樣設計**」。

## 📑 目錄

- [1. 接手新專案 0 → 1](#1-接手新專案-0--1)
- [2. 新增零件](#2-新增零件)
- [3. 修改現有項目 / 接真實後端](#3-修改現有項目--接真實後端)
- [4. Debug 與狀況排查](#4-debug-與狀況排查)

---

## 1. 接手新專案 0 → 1

從 git clone 到第一次跑起來、客製化基本資訊，全流程約 15 分鐘。

### 1.1 環境準備

| 項目 | 版本 | 驗證指令 |
|---|---|---|
| Node.js | ≥ 20 | `node -v` |
| npm | ≥ 10 | `npm -v` |
| Git | 任何近期版本 | `git --version` |

### 1.2 取得程式碼並安裝

```bash
git clone https://github.com/ronlu057/master_v2.git my-new-site
cd my-new-site
npm install
```

`npm install` 約 30 秒完成（含 Nuxt、Pinia、Lenis、GSAP、Vite-SVG-Loader、Sass）。

### 1.3 選擇專案類型

編輯 [`.env`](../.env)，依需求選一：

```bash
# module       模組件套版（首頁 + 內頁皆用 block 模組組裝）
# custom-home  客製首頁（首頁手刻、內頁走 block 模組）
# full-custom  全部客製開發（首頁 + 內頁皆手刻）
# shop         購物類型
# temp         臨時站（精簡單頁）
NUXT_PUBLIC_PROJECT_TYPE=module
```

> 詳見白皮書 [§4 五種專案類型](./開發母版專案.md#4-五種專案類型)。

### 1.4 選擇 Header 與 Banner 版型

```bash
# Header（內含的版型：Header01 / Header02 / header_value）
NUXT_PUBLIC_HEADER=Header01

# 內頁 Banner
NUXT_PUBLIC_PAGE_BANNER=PageBanner01

# 首頁 Banner block（輪播）
NUXT_PUBLIC_BLOCK_BANNER=BlockBanner01
```

各版型差異請啟動 dev server 後直接切換看實際畫面。

### 1.5 啟動 dev server

```bash
npm run dev
```

瀏覽 `http://localhost:3000`。

### 1.6 替換 Logo

1. 把客戶 Logo 放到 `assets/icon/logo-AD.svg`（純向量），或 `public/img/logo/logo-AD.svg`（如果含 base64 嵌入圖）
2. 改 [`components/headers/Header01.vue`](../components/headers/Header01.vue) line 內的 `<img src="...">`
3. 若是純向量，建議改為 `?component` import：

```vue
<script setup>
import LogoAD from '~/assets/icon/logo-AD.svg?component'
</script>
<template>
  <NuxtLink class="logo" to="/" title="回首頁">
    <LogoAD />
  </NuxtLink>
</template>
```

> 詳見白皮書 [§9.10 SVG 引入](./開發母版專案.md#94-樣式與主題)（SVG 引入規則）。

### 1.7 客製化 mock 資料

修改 [`server/mock/data/`](../server/mock/data/) 內的 JSON 檔（前端開發階段用）：

| 檔案 | 內容 |
|---|---|
| `firm.json` | 公司名稱、聯絡資訊、社群連結 |
| `menu.json` | 主選單 / 行動版選單 / 頁尾選單 |
| `home.json` | 首頁區塊資料 |
| `news.json` / `about.json` | 內容頁資料 |
| `banners.json` | Banner 圖片 / 文字 / 連結 |

> 改 JSON 後**需重啟 dev server**（Nuxt 不會自動 reload mock）。

### 1.8 接真實後端（部署前）

```bash
# .env
NUXT_PUBLIC_API_BASE=https://your-backend.example.com
```

`/api/*` 會自動指向真實後端，mock JSON 失效。**部署前務必驗證每個 endpoint 都能正常回應。**

詳見 [§3.4 接真實後端步驟](#34-從-mock-切換到真實後端)。

### 1.9 正式建置

```bash
npm run build
npm run preview   # 本地預覽 production build
```

`.output/` 目錄即為部署產物。

---

## 2. 新增零件

> 「零件」= Header 版型 / Banner 版型 / Block 區塊 / 頁面 / 共用組件。

> [!CAUTION]
> **新增任何零件時，SCSS 一律禁用 `&__` BEM 巢狀寫法**。class 必須寫完整名稱（例 `.card__title` 而非 `.card { &__title }`）。詳見 [製作規範 §3.1.1](./製作規範.md#311-禁用-bem-__-巢狀寫法) / [白皮書 §9.4.1](./開發母版專案.md#941-禁用-bem-__-巢狀寫法)。

### 2.1 新增 Header 版型

**情境**：客戶提供新設計稿，要做第三種 header。

| 步驟 | 動作 |
|---|---|
| ① | 在 [`components/headers/`](../components/headers/) 建檔，例如 `Header03.vue` |
| ② | 仿 [`Header01.vue`](../components/headers/Header01.vue) 的 `<script setup>` 結構（必要的 composable：`useProject` / `useSiteMenu` / `useUiStore`） |
| ③ | 設計 `<template>` 與 `<style lang="scss" scoped>` |
| ④ | `.env` 改 `NUXT_PUBLIC_HEADER=Header03`，重啟 dev server |

> [!IMPORTANT]
> **`AppHeader.vue` 不需改動**。檔名即是設定值，由 [`AppHeader.vue`](../components/AppHeader.vue) 的 `import.meta.glob` 自動掃描。

詳見白皮書 [§11 Header 版型切換](./開發母版專案.md#11-header-版型切換)。

### 2.2 新增 Banner 版型

**情境**：要做不同視覺風格的首頁輪播（例 Slide 取代 Fade、Parallax 視差等）。

| 步驟 | 動作 |
|---|---|
| ① | 在 [`components/banners/`](../components/banners/) 建檔，**檔名前綴**須為 `PageBanner` 或 `BlockBanner` |
| ② | 仿 `BlockBanner01.vue` 或 `PageBanner01.vue` 結構（同樣 `defineProps`） |
| ③ | `.env` 改 `NUXT_PUBLIC_BLOCK_BANNER=BlockBanner02`（或 PAGE_BANNER） |
| ④ | 重啟 dev server |

> [!CAUTION]
> 派發器 [`BlockBanner.vue`](../components/BlockBanner.vue) 用 `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"`，**新版型必須宣告對應 `defineProps`** 才能收到 `title` / `rows` 等資料。

詳見白皮書 [§12 Banner 版型切換](./開發母版專案.md#12-banner-版型切換)。

### 2.3 新增 Block 區塊

**情境**：首頁要新增「合作品牌跑馬燈」這類專屬區塊。

| 步驟 | 動作 |
|---|---|
| ① | 在 `components/` 新增 `BlockPartners.vue`（檔名前綴須為 `Block`） |
| ② | 宣告 `defineProps({ title, item })`，`item.rows` 為資料陣列 |
| ③ | 開 [`components/BlockRenderer.vue`](../components/BlockRenderer.vue) 加進對照表 |
| ④ | 後端 / mock 在首頁 slot 內加 `{ type: 'partners', title: '...', item: { rows: [...] } }` |

> [!IMPORTANT]
> Nuxt 自動引入無法用 `resolveComponent('字串')`，**Block 必須在 BlockRenderer 內手動 `import` 後放入對照表**。

詳見白皮書 [§8 Block 模組系統](./開發母版專案.md#8-block-模組系統)。

### 2.4 新增頁面

**情境**：要新增「投資人專區」頁面。

| 步驟 | 動作 |
|---|---|
| ① | 在 `pages/` 建 `investors/index.vue` |
| ② | 在 mock `server/mock/data/menu.json` 加選單項目 `{ "title": "投資人專區", "url": "/investors" }` |
| ③ | 頁面內用 `<PageBanner page="investors" title="投資人專區" />` 套統一 banner |
| ④ | 用 `useApiData('/investors/list')` 取資料（若有對應 endpoint） |

### 2.5 新增共用組件

**情境**：寫一個「圖文卡片」組件給多個頁面共用。

| 步驟 | 動作 |
|---|---|
| ① | 在 `components/` 建 `MediaCard.vue`（PascalCase 多字詞） |
| ② | 宣告 `defineProps` 清楚每個輸入 |
| ③ | 用 `<style lang="scss" scoped>` 寫樣式（**不要**全域 CSS） |
| ④ | 直接在任何頁面用 `<MediaCard :title="..." />`，Nuxt 自動引入 |

> [!WARNING]
> **不要**用 TypeScript（`<script setup lang="ts">`）—— 本專案無 TS 政策（白皮書 [§9.1](./開發母版專案.md#91-vue-元件規範)）。

---

## 3. 修改現有項目 / 接真實後端

### 3.1 修改 SCSS 變數（主色 / 字體）

| 修改內容 | 改哪 |
|---|---|
| 全域主題色 | [`assets/styles/main.scss`](../assets/styles/main.scss) 的 `:root { --color-primary: ... }` |
| 五種專案類型的色彩主題 | [`assets/styles/main.scss`](../assets/styles/main.scss) 的 `[data-project='xxx']` |
| SCSS 變數（`$web_font_color` 等） | [`assets/styles/_variables.scss`](../assets/styles/_variables.scss) |
| 字體 | [`nuxt.config.js`](../nuxt.config.js) 的 `app.head.link` |

> 詳見白皮書 [§9.4 樣式與主題](./開發母版專案.md#94-樣式與主題)、[§9.9 Google Fonts](./開發母版專案.md#99-google-fonts-字型)。

### 3.2 新增 Google 字型

1. 到 [Google Fonts](https://fonts.google.com) 取 URL 參數段
2. 改 [`nuxt.config.js`](../nuxt.config.js) 的 `link[].href`，串接 `&family=新字型`
3. （可選）更新 `_variables.scss` 的 `$web_font` 變數
4. 重啟 dev server

> 詳見白皮書 [§9.9.1 新增或修改字型](./開發母版專案.md#991-新增或修改字型)。

### 3.3 新增「需要 lock 背景捲動」的 modal

1. 開啟 modal 時 `$lenis.stop()`、關閉時 `$lenis.start()`
2. **不要**用 `document.body.style.overflow = 'hidden'`（Lenis 是 transform 模擬，CSS overflow 無效）
3. 若用第三方套件（LightGallery 等），把它加在 body 上的 class 加進 [`plugins/lenis.client.js`](../plugins/lenis.client.js) 的 `LOCK_BODY_CLASSES`

> 詳見白皮書 [§9.11.3 / §9.11.5 modal 鎖捲動](./開發母版專案.md#9113-進階modal--drawer-鎖背景捲動)。

### 3.4 從 mock 切換到真實後端

1. **盤點 mock endpoint** — 開 [`server/routes/api/[...slug].js`](../server/routes/api/[...slug].js) 確認後端要實作哪些路徑（如 `/home/view`、`/menu/view`）
2. **比對回應格式** — 確保後端遵循 [一般網站白皮書 §2.1](https://hello.show.ad-design.tw/docs/一般網站白皮書.md) 的 `{ status, data: { payload, meta } }` 統一格式
3. **修改 `.env`**：
   ```bash
   NUXT_PUBLIC_API_BASE=https://your-backend.example.com
   ```
4. **重啟 dev server**，每個頁面逐一驗證
5. **deploy 前**確認 production `.env` 也指向正式後端

> [!CAUTION]
> 若後端格式不同，**不要**改 [`composables/useApi.js`](../composables/useApi.js) 的 `unwrap` 邏輯（避免破壞 mock 也支援統一格式的設計）—— 改成在後端側調整回應格式，或在後端與前端之間加一層 adapter。

### 3.5 多語系（@nuxtjs/i18n 已裝）

✅ 已預裝 `@nuxtjs/i18n` v10.4.0、Header 01 / 02 已接通切換邏輯、預設 4 語系（tw / en / jp / kr）。

#### 3.5.1 新增語系

```vue
<!-- 例：新增韓語以外的另一個語系，這裡示範阿拉伯語 -->
```

| 步驟 | 動作 |
|---|---|
| ① | 編輯 [`nuxt.config.js`](../nuxt.config.js) 的 `i18n.locales[]`，新增一筆：`{ code: 'ar', file: 'ar.json', name: 'العربية', language: 'ar-SA', dir: 'rtl' }`（`dir: 'rtl'` 給右至左語系） |
| ② | 建翻譯檔 [`i18n/locales/ar.json`](../i18n/locales/)，複製 `tw.json` 翻譯內容（**key 結構必須一致**） |
| ③ | 重啟 dev server |

新語系自動出現在 Header 切換 popup（無需改 Header 元件）。

#### 3.5.2 移除語系

| 步驟 | 動作 |
|---|---|
| ① | 從 [`nuxt.config.js`](../nuxt.config.js) `i18n.locales[]` 移除該筆 |
| ② | （可選）刪 `i18n/locales/<code>.json` |
| ③ | 重啟 dev server |

> 剩 1 個語系時 Header icon 自動隱藏（`v-if="languages.length > 1"`）。

#### 3.5.3 編輯翻譯字串

直接編輯 [`i18n/locales/<code>.json`](../i18n/locales/)。改完**不用重啟**（i18n 有 HMR），瀏覽器自動 reload。

#### 3.5.4 改預設語系

編輯 [`.env`](../.env)：

```bash
NUXT_PUBLIC_DEFAULT_LANG=en
```

`nuxt.config.js` 的 `i18n.defaultLocale` 會從這裡讀。重啟 dev server。

#### 3.5.5 切換 URL 策略（SEO）

目前是 `no_prefix`（URL 不變、靠 cookie）。要做 SEO 時改：

```js
// nuxt.config.js
i18n: {
  strategy: 'prefix_except_default',  // tw: /about、en: /en/about
}
```

並在每頁加 `useLocaleHead()` 自動產生 hreflang。

#### 3.5.6 在元件內使用

```vue
<script setup>
const { t, locale, locales, setLocale } = useI18n()
</script>

<template>
  <h1>{{ t('site.title') }}</h1>      <!-- 取翻譯 -->
  <p>{{ locale }}</p>                  <!-- 取目前語系 -->
  <button @click="setLocale('en')">EN</button>  <!-- 切換 -->
</template>
```

template 內也可直接 `$t('btn.more')` 縮寫。

> 詳見白皮書 [§9.10 多語系](./開發母版專案.md#910-多語系nuxtjsi18n)。

---

## 4. Debug 與狀況排查

### 4.1 改了 `.env` 但沒生效

✅ **重啟 dev server**。`.env` 變更不在 HMR 範圍。

```bash
# Ctrl+C 中斷
npm run dev
```

### 4.2 改了 `nuxt.config.js` 但沒生效

✅ 同樣**重啟 dev server**。

### 4.3 改了 mock JSON 但沒生效

✅ 同樣**重啟 dev server**。Mock JSON 由 [`server/mock/db.js`](../server/mock/db.js) 在 server 首次載入時讀檔，不會 watch JSON 檔。

### 4.4 SVG 引入後顏色不對 / hover 不變色

**症狀**：SVG 顯示原本顏色，CSS 的 `fill: $web_font_color` 沒效。

**原因**：SVG 內含 `<defs><style>.st0 { fill: #xxx }</style></defs>` —— 內部 style 優先級高於外部 CSS。

**解法**：清掉 `<defs>` 區塊與 path 的 `class="st0"`，讓外部 CSS 接管。可用以下 Node 腳本批次處理（路徑與檔名請依需求修改）：

```bash
node -e "const fs=require('fs');const files=['search_icon','language_icon','shopcart_icon'];for(const n of files){const f='assets/icon/'+n+'.svg';let c=fs.readFileSync(f,'utf8');c=c.replace(/\s*<defs>[\s\S]*?<\/defs>/g,'').replace(/\s*class=\"st0\"/g,'');fs.writeFileSync(f,c);}"
```

> [!CAUTION]
> 含品牌色的 SVG（如 LINE logo `#BF3131`）**不要清** —— 那是必須保留的品牌色，清掉就不對了。

### 4.5 SCSS 變數編譯失敗（Undefined variable）

**症狀**：頁面跑出 `Undefined variable: $web_font_color`。

**原因**：可能是 SCSS partial 改名 / `nuxt.config.js` 的 `additionalData` 路徑壞掉。

**解法**：
1. 確認 [`assets/styles/_variables.scss`](../assets/styles/_variables.scss) 存在且包含該變數
2. 確認 [`nuxt.config.js`](../nuxt.config.js) `vite.css.preprocessorOptions.scss.additionalData` 指向 `~/assets/styles/variables`
3. 重啟 dev server

詳見白皮書 [§9.4 樣式與主題](./開發母版專案.md#94-樣式與主題)。

### 4.6 環境變數 boolean 行為怪異

**症狀**：`.env` 設 `NUXT_PUBLIC_ENABLE_SHOP=false` 但購物 UI 仍出現。

**原因**：`.env` 值前後**多了空格**（如 `= false`），JS `!!" false"` 為 `true`。

**解法**：
1. 清掉 `.env` 值前後的空格
2. composable 內用 `parseBool()` 而非 `!!`（白皮書 [§9.13](./開發母版專案.md#913-env-boolean-值正確寫法)）

### 4.7 路由切換後 ScrollTrigger 行為怪 / 慢

**症狀**：切換頁面後動畫不對、或頁面變慢。

**原因**：上一頁的 ScrollTrigger 沒 `kill()`，殘留在 GSAP 內持續計算。

**解法**：在元件的 `onBeforeUnmount` 內清理：

```js
onBeforeUnmount(() => {
  $ScrollTrigger.getAll().forEach((st) => {
    if (st.vars.trigger === target.value) st.kill()
  })
})
```

詳見白皮書 [§9.11.6 GSAP / ScrollTrigger 用法](./開發母版專案.md#9116-gsap--scrolltrigger-用法)。

### 4.8 「Cannot access 'renderer' before initialization」

**症狀**：Nuxt server 啟動或頁面顯示這個錯誤。

**原因**：server 端某個 module 在初始化階段拋錯（常見：`fs.readFileSync` 找不到檔案、`import` 失敗）。

**解法**：往上看 stack trace，找真正拋錯的那一行。通常是路徑問題或檔案缺失。

### 4.9 元件不會自動引入

**症狀**：寫了 `<MyComponent />` 但渲染失敗。

**檢查**：
1. 檔名是否 PascalCase 多字詞（如 `MyComponent.vue`）？
2. 檔案是否在 `components/` 內（含子目錄）？
3. [`nuxt.config.js`](../nuxt.config.js) `components` 設定是否有 `pathPrefix: false`？

### 4.10 PageBanner / BlockBanner 切了版型但畫面沒變

✅ 確認 `.env` 對應變數有改、檔名前綴正確（`PageBanner` 或 `BlockBanner`）、且**已重啟 dev server**。

---

## 📚 延伸閱讀

- [開發母版專案.md](./開發母版專案.md) — 規範與架構說明
- [製作規範.md](./製作規範.md) — DO / DON'T 清單
- [教學手冊.md](./教學手冊.md) — 新進者入門 + 設計師/PM 指南
- [一般網站白皮書](https://hello.show.ad-design.tw/docs/一般網站白皮書.md) — 後端 API 規格
