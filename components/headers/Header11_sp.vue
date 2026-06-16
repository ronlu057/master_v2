<script setup>
// 頁首版型 11 — SP 全螢幕 Panel 元件（配合 Header11.vue 使用）
// 結構：左側 120px sidebar 漢堡按鈕 + 全螢幕 panel（左 logo+nav+navtool+social / 右 WebGL 波浪背景）
// 行為：點 sidebar 漢堡 → ui.menuOpen 切換 → panel 開合
//      panel 開啟時鎖背景捲動（Lenis stop）
//
// WebGL：原 JS 用 GLSL shader 對圖片做 sin 波浪扭曲動畫，shader 在原專案外部找不到，
//        以標準的「圖片 UV 波浪扭曲」shader 重新實作（視覺效果同類型）。
//        Texture 圖片為 /img/other/other20.jpg（請放這張 banner 圖到對應位置）。
import { useUiStore } from '~/stores/useUiStore'

const { isMinimal } = useProject()
const ui = useUiStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const { $lenis } = useNuxtApp()

// i18n
const { t, locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

// 搜尋
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  ui.closeMenu()
  keyword.value = ''
}

// 社群圖示（取 firm.social 內有值的）
const socialList = computed(() => {
  const s = firmData.value?.firm?.social || {}
  return [
    { name: 'facebook',  url: s.facebook,  icon: '/img/icon/fb_icon.svg',       label: 'Facebook' },
    { name: 'instagram', url: s.instagram, icon: '/img/icon/ig_new_icon.svg',   label: 'Instagram' },
    { name: 'line',      url: s.line,      icon: '/img/icon/line_new_icon.svg', label: 'LINE' },
    { name: 'youtube',   url: s.youtube,   icon: '/img/icon/youtube_icon.svg',  label: 'YouTube' },
    { name: 'twitter',   url: s.twitter,   icon: '/img/icon/x_icon.svg',        label: 'X' },
  ].filter((item) => item.url)
})

// 鎖背景捲動：panel 開啟時 lenis.stop()
watch(() => ui.menuOpen, (open) => {
  if (!$lenis) return
  if (open) $lenis.stop()
  else $lenis.start()
})

// ── WebGL 波浪動畫 ───────────────────────────────────────
const canvasContainer = ref(null)
let webglCleanup = null

const initWebgl = () => {
  if (!canvasContainer.value) return
  const canvas = document.createElement('canvas')
  canvasContainer.value.appendChild(canvas)
  const gl = canvas.getContext('webgl')
  if (!gl) return

  // 標準 GLSL — vertex 把 -1~1 四角直接輸出，fragment 對 UV 加 sin 扭曲再採樣
  const vsSrc = `
    attribute vec3 position;
    varying vec2 vUv;
    void main() {
      vUv = position.xy * 0.5 + 0.5;
      gl_Position = vec4(position, 1.0);
    }
  `
  const fsSrc = `
    precision mediump float;
    uniform float time;
    uniform sampler2D texture;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.x += sin(uv.y * 10.0 + time * 1.2) * 0.018;
      uv.y += cos(uv.x * 8.0 + time * 0.8) * 0.018;
      gl_FragColor = texture2D(texture, uv);
    }
  `

  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSrc))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSrc))
  gl.linkProgram(program)
  gl.useProgram(program)

  // 全螢幕四角頂點
  const positions = new Float32Array([
    -1,  1, 0,
    -1, -1, 0,
     1,  1, 0,
     1, -1, 0,
  ])
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  const posLoc = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0)

  const timeLoc = gl.getUniformLocation(program, 'time')
  const texLoc = gl.getUniformLocation(program, 'texture')
  gl.uniform1i(texLoc, 0)

  // 載入紋理圖
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = '/img/other/other20.jpg'
  let texture = null
  let rafId = null

  const resize = () => {
    if (!canvasContainer.value) return
    const w = canvasContainer.value.clientWidth
    const h = canvasContainer.value.clientHeight
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  const render = (t) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniform1f(timeLoc, t / 1000)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    rafId = requestAnimationFrame(render)
  }

  img.addEventListener('load', () => {
    texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    resize()
    rafId = requestAnimationFrame(render)
  })

  img.addEventListener('error', () => {
    console.warn('[Header11_sp] WebGL texture image not found: /img/other/other20.jpg')
  })

  window.addEventListener('resize', resize)

  webglCleanup = () => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    if (texture) gl.deleteTexture(texture)
    gl.deleteBuffer(buf)
    gl.deleteProgram(program)
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
  }
}

onMounted(() => {
  initWebgl()
})
onBeforeUnmount(() => {
  if (webglCleanup) webglCleanup()
  if ($lenis) $lenis.start()
})
</script>

<template>
  <!-- 左側 120px sidebar 漢堡按鈕（桌面才顯示，< 1201 隱藏） -->
  <button
    v-if="!isMinimal"
    type="button"
    :class="['mbPanel11_btn_sp', { active: ui.menuOpen }]"
    :aria-label="$t('aria.menu')"
    @click="ui.toggleMenu"
  >
    <span class="bars">
      <span class="bar bar1"></span>
      <span class="bar bar2"></span>
      <span class="bar bar3"></span>
    </span>
    <p class="txt1">menu</p>
    <p v-show="ui.menuOpen" class="txt2">close</p>
  </button>

  <!-- 全螢幕 panel -->
  <div :class="['mbPanel11_sp', { show: ui.menuOpen }]">
    <div class="left">
      <div class="top">
        <NuxtLink class="logo" to="/" :title="$t('site.back_home')" @click="ui.closeMenu">
          <SiteLogo alt="Logo" />
        </NuxtLink>
      </div>

      <div class="bottom">
        <div class="nav">
          <div class="navbar">
            <ul class="navmenu">
              <li v-for="(item, i) in menuData.mobile" :key="item.url">
                <NuxtLink :to="item.url" @click="ui.closeMenu">
                  {{ String(i + 1).padStart(2, '0') }}
                  <span>{{ item.title }}</span>
                </NuxtLink>
                <div v-if="item.children?.length" class="navmenu_sub">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.url"
                    :to="child.url"
                    @click="ui.closeMenu"
                  >
                    <span>{{ child.title }}</span>
                  </NuxtLink>
                </div>
              </li>
            </ul>

            <div class="copyright">
              <p>{{ firmData?.firm?.footer?.title2 || '' }}</p>
            </div>
          </div>

          <div class="navtool">
            <form class="search_form" @submit.prevent="onSearch">
              <button type="submit" :aria-label="$t('btn.search')">
                <svg viewBox="0 0 18 18" width="18" height="18">
                  <path d="M6.7,0c0.2,0,0.5,0,0.7,0c0.7,0.1,1.4,0.3,2.1,0.6c2.4,1,4,3.2,4.4,5.8c0.3,2-0.1,3.9-1.3,5.5l3.9,3.9c0.6,0.6,0.6,1.5,0,2.1c-0.6,0.6-1.5,0.6-2.1,0L10.4,14c-1.6,1.1-3.5,1.6-5.5,1.3C2.3,14.9,0.1,12.9,0,10.5C0,10.4,0,10.3,0,10.2v-3c0-0.1,0-0.2,0-0.3C0.5,3.6,3.3,0.5,6.7,0z M7,1.8C4.1,1.8,1.8,4.1,1.8,7c0,2.9,2.4,5.2,5.2,5.2c2.9,0,5.2-2.3,5.2-5.2C12.3,4.1,9.9,1.8,7,1.8z"/>
                </svg>
              </button>
              <input
                v-model="keyword"
                type="text"
                autocomplete="off"
                :placeholder="t('btn.search')"
                :aria-label="$t('aria.search')"
              />
            </form>

            <div v-if="languages.length > 1" class="lang_toggle">
              <p>Language:</p>
              <p>
                <a
                  v-for="lang in languages"
                  :key="lang.code"
                  href="javascript:;"
                  :class="{ active: lang.code === locale }"
                  @click.prevent="setLocale(lang.code)"
                >
                  {{ lang.label }}
                </a>
              </p>
            </div>

            <NuxtLink class="sp_btn" to="/contact">
              <div>
                <div>
                  <p>contact us</p>
                  <p>
                    {{ $t('btn.contact_us') }}
                    <svg viewBox="0 0 15.8 11.5" width="15.8" height="11.5">
                      <path d="M13.3,5c-0.1,0-0.1,0-0.2,0C9,5,4.9,5,0.9,5C0.6,5,0.2,5.2,0.1,5.6C0,6,0.3,6.4,0.7,6.5c0.1,0,0.1,0,0.2,0c4.1,0,8.1,0,12.2,0c0.1,0,0.1,0,0.2,0c-0.1,0.1-0.1,0.1-0.2,0.2C12,7.8,10.8,9,9.6,10.2c-0.4,0.4-0.4,0.9,0,1.2c0.3,0.3,0.8,0.3,1.1,0c0.1,0,0.1-0.1,0.1-0.1c1.6-1.6,3.2-3.2,4.8-4.8c0.4-0.4,0.4-0.8,0-1.2c-1.6-1.6-3.3-3.3-4.9-4.9c-0.3-0.3-0.7-0.4-1.1-0.2C9.4,0.2,9.2,0.8,9.5,1.2c0,0.1,0.1,0.1,0.2,0.2c1.2,1.2,2.4,2.4,3.5,3.5C13.2,4.9,13.3,4.9,13.3,5z"/>
                    </svg>
                  </p>
                </div>
              </div>
            </NuxtLink>

            <div v-if="socialList.length" class="social_media">
              <a
                v-for="item in socialList"
                :key="item.name"
                :href="item.url"
                target="_blank"
                rel="noopener"
                :aria-label="item.label"
              >
                <img :src="item.icon" :alt="item.label" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側 WebGL 波浪背景 -->
    <div ref="canvasContainer" class="right"></div>
  </div>
</template>

<style lang="scss" scoped>
// ── 左側 sidebar 漢堡按鈕（桌面 ≥1201 才顯示） ─────────────
.mbPanel11_btn_sp {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: fluid(120);
  background: none;
  border: none;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: $z_mbPanel_btn;
  transition: all 0.3s;

  @include rwd-1200 { display: none; }

  .bars {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: fluid(30);
    height: fluid(18);

    .bar {
      position: relative;
      top: 0;
      width: 100%;
      height: 2px;
      background: $web_header_2;
      transition:
        top 0.3s 0.3s,
        width 0.3s 0.3s,
        transform 0.3s,
        background 0.3s;
    }

    .bar2 { width: 66.67%; }
  }

  p {
    color: $web_header_2;
    font-size: fluid-fz(14);
    font-weight: 600;
    line-height: 1;
    margin-top: fluid(3);
    transition: all 0.3s;
  }

  .txt2 { display: none; }

  &.active {
    background: $web_header_1;
    border-right: 2px solid rgba(255, 255, 255, 0.2);

    .bars .bar {
      background: #fff;
      transition:
        top 0.3s,
        width 0.3s,
        transform 0.3s 0.3s,
        background 0.3s;

      &.bar1 { top: 8px;  transform: rotate(-25deg); }
      &.bar2 { width: 0%; }
      &.bar3 { top: -8px; transform: rotate(25deg); }
    }

    p { color: #fff; }
  }
}

// ── 全螢幕 panel ────────────────────────────────────────
.mbPanel11_sp {
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: fluid(120);
  background: $web_header_1;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: $z_mbPanel_95;
  transform: translateX(-100%);
  transition: all 0.3s, transform 0s 0.3s;

  @include rwd-1200 { display: none; }

  &.show {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0%);
    transition: all 0.3s, transform 0.6s ease-out 0.3s;

    .left .top,
    .left .bottom {
      opacity: 1;
      transform: translateX(0);
      transition: all 1s 1.5s;
    }

    .right canvas {
      transform: translateX(0);
      transition: transform 1s 1s;
    }
  }
}

.left {
  width: 69.2222%;
  padding: 0 12.1875vw 0 6.25vw;
  transition: all 0.3s;

  @include rwd-1680 { padding: 0 6.25vw; }
  @include rwd-1280 { padding: 0 4.5vw; }

  .top {
    display: flex;
    align-items: center;
    height: fluid(100);
    opacity: 0;
    transform: translateX(-40px);
    transition: all 0s 0.3s;

    .logo {
      display: block;

      img {
        max-height: fluid(60);
        filter: brightness(0) invert(1);
      }
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    height: calc(100vh - 100px);
    padding: fluid(10) 0 fluid(40);
    opacity: 0;
    transform: translateX(-40px);
    transition: all 0s 0.3s;

    .nav {
      display: flex;
      width: 100%;
      max-height: 100%;
      margin: 0 -2.5vw;
      overflow-y: auto;

      @include rwd-1280 { margin: 0 -1.5625vw; }

      > * {
        padding: 0 2.5vw;

        @include rwd-1280 { padding: 0 1.5625vw; }
      }
    }
  }
}

.navbar { width: 58.27%; }

.navmenu {
  list-style: none;
  margin: 0;
  padding: 0;

  > li {
    position: relative;
    padding: fluid(18) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    &:first-child { padding-top: 0; }

    > a {
      display: flex;
      align-items: flex-end;
      color: #fff;
      font-size: fluid-fz(30);
      line-height: 1;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding-bottom: fluid(7);
      transition: all 0.3s;

      @include rwd-1440 { font-size: 26px; }

      span {
        position: relative;
        top: -1px;
        font-size: fluid-fz(16);
        letter-spacing: 2px;
        margin-left: fluid(20);
      }

      &:hover,
      &.router-link-active {
        color: $web_header_2;
      }
    }

    .navmenu_sub {
      display: flex;
      flex-wrap: wrap;

      > a {
        display: block;
        color: #fff;
        font-size: fluid-fz(14);
        margin-right: fluid(20);
        transition: all 0.3s;

        &:hover,
        &.router-link-active {
          color: $web_header_2;
        }
      }
    }
  }
}

.copyright {
  margin-top: fluid(20);

  p {
    color: #fff;
    font-size: fluid-fz(13);
  }
}

.navtool {
  width: 41.73%;

  > * + * { margin-top: 40px; }
}

.search_form {
  display: flex;
  align-items: center;
  width: fit-content;
  margin: 0 auto 0 0;
  padding-bottom: fluid(9);
  border-bottom: 1px solid #fff;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-right: fluid(15);

    svg {
      display: block;
      fill: #fff;
    }
  }

  input {
    width: fluid(140);
    color: #fff;
    font-weight: 700;
    padding: 0 fluid(5) 0 0;
    background: transparent;
    border: 0;
    transition: all 0.3s;

    &::placeholder { color: #fff; }
    &:focus { width: 200px; outline: none; }
  }
}

.lang_toggle {
  p:nth-child(1) {
    color: #fff;
    font-size: fluid-fz(16);
    font-weight: 700;
    margin-bottom: fluid(22);
  }

  p:nth-child(2) {
    display: flex;
    flex-wrap: nowrap;
    width: fit-content;
    padding-right: fluid(15);
    padding-bottom: fluid(10);
    margin: 0 fluid(-5);
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%);
    background-size: calc(100% - 10px) 1px;
    background-position: 5px bottom;
    background-repeat: no-repeat;

    a {
      display: block;
      flex-shrink: 0;
      position: relative;
      color: #fff;
      font-size: fluid-fz(13);
      letter-spacing: 0.5px;
      white-space: nowrap;
      padding: 1px fluid(10);
      transition: all 0.3s;

      &.active { font-weight: 700; }

      & + a::before {
        content: '';
        position: absolute;
        top: 51%;
        left: 0;
        width: 1px;
        height: fluid(13);
        background: #fff;
        transform: translateY(-50%);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: fluid(5);
        bottom: 0;
        left: fluid(5);
        background: transparent;
        z-index: -1;
        transition: all 0.3s;
      }

      &:hover {
        color: $web_font_color;
        &::after { background: #fff; }
      }
    }
  }
}

.sp_btn {
  display: block;
  position: relative;
  width: 100%;
  max-width: fluid(250);
  padding: fluid(10);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(135deg, $web_header_1 0%, $web_header_2 30%, $web_header_2 70%, $web_header_1 100%);
    transition: all 0.3s;
  }

  &:hover::before { transform: translateX(-50%); }

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: fluid(80);
    border: 1px solid rgba(255, 255, 255, 0.2);

    div {
      padding: fluid(10);

      p:nth-child(1) {
        color: #fff;
        font-size: fluid-fz(18);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      p:nth-child(2) {
        color: #fff;
        font-size: fluid-fz(16);
        font-weight: 500;

        svg {
          display: inline-block;
          fill: #fff;
          margin-left: fluid(20);
        }
      }
    }
  }
}

.social_media {
  display: flex;
  flex-wrap: wrap;
  gap: 0 fluid(10);

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fluid(35);
    height: fluid(35);
    border-radius: 50%;
    transition: all 0.3s;

    img {
      width: fluid(22);
      height: fluid(22);
      filter: brightness(0) invert(1);
      transition: all 0.3s;
    }

    &:hover img { opacity: 0.7; }
  }
}

// ── 右側 WebGL 波浪背景 ─────────────────────────────────
.right {
  width: 30.7778%;
  overflow: hidden;
  position: relative;

  // canvas 由 JS 動態插入；初始位置在 -100%，show 時透過 transition slide-in
  :deep(canvas) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translateX(-100%);
    transition: transform 0s 0.3s;
    display: block;
  }
}
</style>
