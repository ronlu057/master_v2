# CLAUDE.md

給 Claude Code 的專案說明 — 接手本專案前請先讀這份，並參閱 [開發母版專案.md](./開發母版專案.md)。

## 專案概述

**master_v2** 是一套 **Nuxt 4 母版**：一份程式碼基底，透過設定切換衍生出**五種專案類型**，用來快速交付不同需求的網站。

- GitHub：https://github.com/ronlu057/master_v2
- 母版開發白皮書：[開發母版專案.md](./開發母版專案.md)
- 後端 API 規格（一般網站白皮書）：https://hello.show.ad-design.tw/docs/一般網站白皮書.md

## 技術棧

Vue 3 + Nuxt 4 + Pinia + Sass。平鋪式目錄結構（無 `app/` 子目錄）。

> ⚠️ **無 TypeScript 政策**：全程純 JavaScript，嚴禁 `.ts` 檔或 `<script lang="ts">`。

## 常用指令

```bash
npm install     # 安裝相依套件
npm run dev     # 開發伺服器 http://localhost:3000
npm run build   # 正式環境建置
npm run docs    # 由 .md 重新產生白皮書 HTML
```

## 設定（`.env`）

| 變數 | 用途 |
|---|---|
| `NUXT_PUBLIC_PROJECT_TYPE` | 五種專案類型：`module`／`custom-home`／`full-custom`／`shop`／`temp`（白皮書 §4） |
| `NUXT_PUBLIC_HEADER` | Header 版型，對應 `components/headers/HeaderXX.vue`（白皮書 §11） |
| `NUXT_PUBLIC_API_BASE` | 留空＝本地 mock JSON；填網域＝真實後端 |

改 `.env` 後需重啟 dev server。

## 在另一台電腦接手

1. 安裝 Claude Code（IDE 擴充／CLI／桌面版），登入 Anthropic 帳號。
2. `git clone https://github.com/ronlu057/master_v2.git`
3. `cd master_v2 && npm install`
4. 在專案資料夾啟動 Claude Code（終端機執行 `claude`，或用 IDE 開啟此資料夾）。

> `.env` 已納入版控、clone 後即附帶（僅含 `NUXT_PUBLIC_*` 公開設定），不需手動重建；如有不同環境需求再自行調整。
> 對話記錄與本機 memory 不會跨電腦；跟著走的只有此 repo。本檔會被 Claude Code 自動載入，作為新電腦的接手依據。

## 開發注意事項

- **不要自行變更白皮書版本號**（`版本：` 行、修訂紀錄），除非使用者明確要求。
- 改白皮書 `.md` 後執行 `npm run docs` 同步 HTML。
- 元件命名 PascalCase；Pinia 採 Setup Store 風格；資料獲取一律經 `composables/useApi.js`。
- 白皮書 §11：Header 多版型用 `import.meta.glob`，勿用 `resolveComponent('字串')`。
