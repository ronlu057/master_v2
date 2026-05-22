# 母版專案 (master-v2)

一套 **Nuxt 4 母版**，透過設定切換支援五種專案類型。技術棧：Vue 3 + Nuxt 4 + Pinia + Sass（純 JavaScript，無 TypeScript）。

## 五種專案類型

| 類型 | `NUXT_PUBLIC_PROJECT_TYPE` | 首頁 | 內頁 | 購物 |
|---|---|---|---|---|
| 模組件套版 | `module` | block 模組組裝 | block 模組組裝 | ✗ |
| 客製首頁 | `custom-home` | 手刻 + block 模組組裝 | block 模組組裝 | ✗ |
| 全部客製開發 | `full-custom` | 手刻 + block 模組組裝 | 手刻 | ✗ |
| 購物類型 | `shop` | 手刻 + block 模組組裝 | block 模組組裝 | ✓ |
| 臨時站 | `temp` | 固定模板 | 隱藏 | ✗ |

> 臨時站 (`temp`) 為精簡模式：隱藏完整選單、單頁呈現，適合「即將開幕」、活動過渡頁、正式站開發期間的暫代站。

切換方式：改 `.env` 的 `NUXT_PUBLIC_PROJECT_TYPE`，重啟 dev server。

## 開發指令

```bash
npm install        # 安裝相依套件
npm run dev        # 啟動本地開發伺服器
npm run build      # 建立正式環境佈署包
npm run preview    # 預覽正式環境
```

## API 串接

- 前端開發階段 `NUXT_PUBLIC_API_BASE` 留空 → 使用本地 mock JSON（`server/routes/api/`）。
- 正式串接時填後端網域 → composables 自動改打真實 API，回應格式不變。
- 所有 API 經 `composables/useApi.js` 統一處理白皮書回應格式 `{ status, data: { payload, meta } }`。

## 目錄結構

```
master_v2/
├─ assets/styles/   全域樣式（CSS 變數主題）
├─ components/      共用元件（含 Block 模組與首頁版型）
├─ composables/     API 串接層、專案類型、SEO
├─ layouts/         版型（default / shop）
├─ pages/           檔案路由頁面
├─ stores/          Pinia 狀態管理
├─ server/
│  ├─ routes/api/   mock JSON 端點（Nitro）
│  └─ mock/db.js    模擬資料
├─ app.vue          入口
├─ app.config.js    五種專案類型功能矩陣
├─ error.vue        錯誤頁
├─ nuxt.config.js
└─ .env
```

詳見 [開發母版專案.md](./開發母版專案.md)。
