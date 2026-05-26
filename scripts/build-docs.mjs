// ============================================================
// 將白皮書 Markdown 轉為美化後的單一 HTML（自帶樣式、可離線開啟）
// 產出：
//   general-website-whitepaper.html   一般網站白皮書（線上來源）
//   master-project-whitepaper.html    母版專案開發白皮書（本地來源）
// 執行：node scripts/build-docs.mjs   或   npm run docs
// ============================================================
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { marked } from 'marked'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = join(root, '技術手冊')

const DOCS = [
  {
    src: 'https://hello.show.ad-design.tw/docs/%E4%B8%80%E8%88%AC%E7%B6%B2%E7%AB%99%E7%99%BD%E7%9A%AE%E6%9B%B8.md',
    localFallback: join(docsDir, '一般網站白皮書.md'),
    out: 'general-website-whitepaper.html',
    docTitle: '一般網站白皮書',
    eyebrow: 'AD-DESIGN · 技術白皮書',
    sub: '形象 / 一般網站 — 前台 API 開發指南',
    tags: ['Home', 'News', 'Menu', 'Contact', 'SEO', 'Search', 'Banner', 'About', 'FAQ', 'I18n'],
  },
  {
    src: join(docsDir, '開發母版專案.md'),
    out: 'master-project-whitepaper.html',
    docTitle: '母版專案開發白皮書',
    eyebrow: 'AD-DESIGN · 開發指南',
    sub: '一套母版，五種專案類型',
    tags: ['模組件套版', '客製首頁', '全部客製開發', '購物類型', '臨時站'],
  },
  {
    src: join(docsDir, 'SOP標準作業流程.md'),
    out: 'sop-procedures.html',
    docTitle: 'SOP 標準作業流程',
    eyebrow: 'AD-DESIGN · 作業流程',
    sub: '接手 / 新增 / 修改 / Debug — 步驟化操作流程',
    tags: ['接手新案', '新增零件', '接後端', 'Debug', '版型切換', 'i18n'],
  },
  {
    src: join(docsDir, '製作規範.md'),
    out: 'development-conventions.html',
    docTitle: '製作規範',
    eyebrow: 'AD-DESIGN · 規範手冊',
    sub: 'DO / DON\'T 條列 — Vue / SCSS / .env / 套件使用',
    tags: ['Vue', 'SCSS', '.env', 'Pinia', 'Lenis', 'GSAP', 'SVG', 'Git'],
  },
  {
    src: join(docsDir, '教學手冊.md'),
    out: 'getting-started.html',
    docTitle: '教學手冊',
    eyebrow: 'AD-DESIGN · 入門指南',
    sub: '新進工程師 / 熟手快速索引 / 設計師 PM 指南',
    tags: ['新手入門', '快速索引', '設計師', 'PM', '練習任務'],
  },
]

// ── GitHub 相容 heading slug ─────────────────────────────
function slugify(text, seen) {
  let s = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w一-鿿぀-ヿ가-힯\s-]/g, '')
    .replace(/\s/g, '-')
    .replace(/^-+|-+$/g, '')
  if (seen[s] === undefined) seen[s] = 0
  else s = `${s}-${++seen[s]}`
  return s
}

// ── 來源讀取（線上優先，失敗退回本地）───────────────────
async function loadSource(doc) {
  if (doc.src.startsWith('http')) {
    try {
      const res = await fetch(doc.src)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      console.log('  來源（線上）：' + doc.src)
      return await res.text()
    } catch (err) {
      console.log('  線上取得失敗（' + err.message + '），改用本地檔')
      return await readFile(doc.localFallback, 'utf8')
    }
  }
  console.log('  來源（本地）：' + doc.src)
  return await readFile(doc.src, 'utf8')
}

// ── Markdown → 美化 HTML ─────────────────────────────────
function buildHtml(doc, md) {
  // 交叉連結：在 marked 處理前替換 .md 連結（避免 href 被 URL 編碼後比對不到）
  // 同層 .md 引用（./xxx.md / xxx.md）→ 對應的 .html
  md = md
    .replace(/\]\(\.?\/?一般網站白皮書\.md(#[^)]*)?\)/g, '](general-website-whitepaper.html$1)')
    .replace(/\]\(\.?\/?開發母版專案\.md(#[^)]*)?\)/g, '](master-project-whitepaper.html$1)')
    .replace(/\]\(\.?\/?SOP標準作業流程\.md(#[^)]*)?\)/g, '](sop-procedures.html$1)')
    .replace(/\]\(\.?\/?製作規範\.md(#[^)]*)?\)/g, '](development-conventions.html$1)')
    .replace(/\]\(\.?\/?教學手冊\.md(#[^)]*)?\)/g, '](getting-started.html$1)')

  let body = marked.parse(md, { gfm: true })

  // 1. 移除最上方重複的 h1（標題改由頁首橫幅呈現）
  body = body.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')

  // 2. GitHub callout（[!WARNING] / [!NOTE] / [!TIP]…）轉為樣式化區塊
  body = body.replace(
    /<blockquote>\s*<p>\[!(\w+)\]\s*(?:<br\s*\/?>\s*)?/g,
    (m, type) => `<blockquote class="callout callout--${type.toLowerCase()}"><p>`,
  )

  // 3. 標題加 GitHub 相容 id，並蒐集 h2 作為側欄目錄
  const seen = {}
  const toc = []
  body = body.replace(/<h([2-6])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const id = slugify(inner, seen)
    const text = inner.replace(/<[^>]+>/g, '')
    if (lvl === '2' && !text.includes('目錄')) toc.push({ id, text })
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`
  })

  // 4. 表格包上可橫向捲動的外框
  body = body
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')

  // 5. 程式碼區塊標上語言標籤
  body = body.replace(
    /<pre><code class="language-(\w+)">/g,
    (m, lang) => `<pre data-lang="${lang.toUpperCase()}"><code class="language-${lang}">`,
  )

  const tocHtml = toc.map((t) => `      <a href="#${t.id}">${t.text}</a>`).join('\n')
  const tagsHtml = doc.tags.map((t) => `<span>${t}</span>`).join('')

  return `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.docTitle} · AD-Design</title>
<style>${CSS}</style>
</head>
<body>
<header class="hero">
  <div class="hero__inner">
    <p class="hero__eyebrow">${doc.eyebrow}</p>
    <h1 class="hero__title">${doc.docTitle}</h1>
    <p class="hero__sub">${doc.sub}</p>
    <div class="hero__tags">${tagsHtml}</div>
  </div>
</header>
<div class="layout">
  <aside class="sidebar">
    <p class="sidebar__title">目錄 CONTENTS</p>
    <nav class="toc">
${tocHtml}
    </nav>
  </aside>
  <main class="content">
${body}
  </main>
</div>
<footer class="foot">
  <p>© 2026 AD-Design 技術部 · ${doc.docTitle}</p>
  <p class="foot__note">本檔由 scripts/build-docs.mjs 自動產生</p>
</footer>
<button class="totop" id="totop" aria-label="回到頂部">↑</button>
<script>${JS}</script>
</body>
</html>
`
}

const CSS = `
:root{
  --ink:#1f2933;--ink-soft:#5b6b7a;--heading:#0f2b29;
  --accent:#0d9488;--accent-dark:#0f766e;--accent-soft:#e6f5f3;
  --bg:#fff;--bg-soft:#f4f7f7;--code-bg:#f6f8fa;--border:#e2e8ea;
  --container:1180px;
}
*{box-sizing:border-box;margin:0;}
html{scroll-behavior:smooth;}
body{
  font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:var(--ink);background:var(--bg-soft);line-height:1.8;-webkit-font-smoothing:antialiased;
}
.hero{background:linear-gradient(135deg,#0f766e 0%,#134e4a 60%,#0c3b38 100%);color:#fff;padding:64px 24px 56px;}
.hero__inner{max-width:var(--container);margin:0 auto;}
.hero__eyebrow{letter-spacing:3px;font-size:13px;font-weight:700;opacity:.7;}
.hero__title{font-size:42px;margin:14px 0 10px;font-weight:800;letter-spacing:1px;}
.hero__sub{font-size:17px;opacity:.88;}
.hero__tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
.hero__tags span{font-size:12px;padding:4px 12px;border-radius:99px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);}
.layout{max-width:var(--container);margin:0 auto;padding:40px 24px 64px;display:grid;grid-template-columns:248px 1fr;gap:40px;align-items:start;}
.sidebar{position:sticky;top:24px;background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:20px 14px;max-height:calc(100vh - 48px);overflow:auto;}
.sidebar__title{font-size:12px;font-weight:800;letter-spacing:2px;color:var(--ink-soft);padding:0 8px 10px;}
.toc{display:flex;flex-direction:column;gap:2px;}
.toc a{font-size:13.5px;color:var(--ink-soft);text-decoration:none;padding:7px 10px;border-radius:8px;border-left:2px solid transparent;transition:.15s;}
.toc a:hover{background:var(--bg-soft);color:var(--accent-dark);}
.toc a.is-active{background:var(--accent-soft);color:var(--accent-dark);font-weight:700;border-left-color:var(--accent);}
.content{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:48px 56px;min-width:0;}
.content h2{font-size:26px;color:var(--heading);margin:48px 0 18px;padding-bottom:12px;border-bottom:2px solid var(--border);scroll-margin-top:24px;}
.content h3{font-size:20px;color:var(--accent-dark);margin:32px 0 12px;scroll-margin-top:24px;}
.content h4{font-size:16px;color:var(--heading);margin:24px 0 10px;}
.content p{margin:14px 0;}
.content ul,.content ol{margin:14px 0;padding-left:24px;}
.content li{margin:6px 0;}
.content a{color:var(--accent-dark);text-decoration:none;border-bottom:1px solid var(--accent-soft);}
.content a:hover{border-bottom-color:var(--accent);}
.content hr{border:none;border-top:1px solid var(--border);margin:36px 0;}
.content strong{color:var(--heading);font-weight:700;}
.content code{font-family:'JetBrains Mono','Fira Code',Consolas,monospace;font-size:.88em;background:var(--accent-soft);color:var(--accent-dark);padding:2px 6px;border-radius:5px;}
.content pre{position:relative;background:var(--code-bg);border:1px solid var(--border);border-radius:10px;padding:22px 20px 20px;margin:18px 0;overflow-x:auto;}
.content pre code{background:none;color:#24343d;padding:0;font-size:13px;line-height:1.7;}
.content pre[data-lang]::before{content:attr(data-lang);position:absolute;top:0;right:0;font-size:11px;font-weight:700;letter-spacing:1px;background:var(--accent);color:#fff;padding:3px 10px;border-radius:0 9px 0 9px;}
.content blockquote{margin:18px 0;padding:14px 20px;background:var(--accent-soft);border-left:4px solid var(--accent);border-radius:0 10px 10px 0;color:var(--ink-soft);}
.content blockquote p{margin:5px 0;}
.content blockquote code{background:#fff;}
.content .callout::before{display:block;font-weight:800;font-size:12.5px;letter-spacing:1px;margin-bottom:6px;}
.content .callout--warning{background:#fff7ed;border-left-color:#f59e0b;color:#854d0e;}
.content .callout--warning::before{content:'⚠ 注意 WARNING';color:#b45309;}
.content .callout--caution{background:#fef2f2;border-left-color:#ef4444;color:#991b1b;}
.content .callout--caution::before{content:'⚠ 警告 CAUTION';color:#dc2626;}
.content .callout--note{background:#eff6ff;border-left-color:#3b82f6;color:#1e40af;}
.content .callout--note::before{content:'ℹ 說明 NOTE';color:#2563eb;}
.content .callout--important{background:#faf5ff;border-left-color:#a855f7;color:#6b21a8;}
.content .callout--important::before{content:'★ 重要 IMPORTANT';color:#9333ea;}
.content .callout--tip{background:#ecfdf5;border-left-color:#10b981;color:#065f46;}
.content .callout--tip::before{content:'✓ 提示 TIP';color:#059669;}
.table-wrap{overflow-x:auto;margin:18px 0;border:1px solid var(--border);border-radius:10px;}
.content table{border-collapse:collapse;width:100%;font-size:14px;}
.content thead th{background:#0f3b38;color:#fff;text-align:left;font-weight:700;padding:11px 14px;white-space:nowrap;}
.content tbody td{padding:10px 14px;border-top:1px solid var(--border);vertical-align:top;}
.content tbody tr:nth-child(even){background:var(--bg-soft);}
.content tbody tr:hover{background:var(--accent-soft);}
.content table code{font-size:12.5px;}
.foot{text-align:center;padding:36px 24px;color:var(--ink-soft);font-size:13px;border-top:1px solid var(--border);background:var(--bg);}
.foot__note{opacity:.6;margin-top:4px;font-size:12px;}
.totop{position:fixed;right:24px;bottom:24px;width:46px;height:46px;border:none;border-radius:50%;background:var(--accent);color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 20px rgba(13,148,136,.4);opacity:0;visibility:hidden;transition:.25s;}
.totop.is-show{opacity:1;visibility:visible;}
@media(max-width:920px){
  .layout{grid-template-columns:1fr;gap:20px;}
  .sidebar{position:static;max-height:320px;}
  .content{padding:32px 22px;}
  .hero{padding:48px 22px 40px;}
  .hero__title{font-size:30px;}
}
@media print{
  body{background:#fff;}
  .sidebar,.totop,.hero__tags{display:none;}
  .content,.sidebar{border:none;}
  .layout{display:block;padding:0;}
}
`.trim()

const JS = `
const toTop=document.getElementById('totop');
addEventListener('scroll',()=>toTop.classList.toggle('is-show',scrollY>600));
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
const links=[...document.querySelectorAll('.toc a')];
const byId={};
links.forEach(a=>byId[a.getAttribute('href').slice(1)]=a);
const spy=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      links.forEach(a=>a.classList.remove('is-active'));
      const a=byId[e.target.id];
      if(a)a.classList.add('is-active');
    }
  });
},{rootMargin:'-12% 0px -78% 0px'});
document.querySelectorAll('.content h2[id]').forEach(h=>spy.observe(h));
`.trim()

// ── 主流程 ───────────────────────────────────────────────
for (const doc of DOCS) {
  console.log('▶ ' + doc.docTitle)
  const md = await loadSource(doc)
  const html = buildHtml(doc, md)
  await writeFile(join(docsDir, doc.out), html, 'utf8')
  console.log('  ✓ 技術手冊/' + doc.out + '（' + html.length + ' bytes）\n')
}
console.log('完成。')
