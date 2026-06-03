<script setup>
// /admin Settings tab 下的「navtool icon 配置」區塊
// 每個 Header 有自己的預設值與 localStorage；切換上方 Header 版型時，本區塊自動跟著切
const { items, toggle, moveUp, moveDown, reset, resetAndReload, state, currentHeader } = useNavtoolConfig()
const { enableShop } = useProject()

const SHOP_DEPENDENT = ['member', 'cart', 'favorite']
const requiresShop = (key) => SHOP_DEPENDENT.includes(key)
</script>

<template>
  <div class="navtool-config">
    <div class="navtool-config__header">
      <h3>
        navtool icon 配置
        <span class="navtool-config__current">— {{ currentHeader }}</span>
      </h3>
      <span v-if="state.isPreviewing" class="navtool-config__badge">localStorage 覆寫中</span>
      <button type="button" class="navtool-config__reset" @click="reset">
        回到 {{ currentHeader }} 預設
      </button>
      <button
        type="button"
        class="navtool-config__reset navtool-config__reset--danger"
        @click="resetAndReload"
      >
        清全部並重整
      </button>
    </div>

    <p class="navtool-config__desc">
      <strong>每個 Header 有自己的 navtool 預設值</strong>，這裡正在編輯 <code>{{ currentHeader }}</code>。
      切換上方「Header 版型」即可看到其他 Header 的設定。
      順序從上到下對應 navtool 左到右。
    </p>

    <ul class="navtool-config__list">
      <li v-for="(item, idx) in items" :key="item.key" class="navtool-config__row">
        <span class="navtool-config__order">{{ idx + 1 }}</span>
        <span class="navtool-config__icon">
          <i :class="['icon', `icon-${item.key === 'cart' ? 'shopcart' : item.key === 'favorite' ? 'like' : item.key === 'social' ? 'facebook' : item.key}`]"></i>
        </span>
        <span class="navtool-config__label">
          {{ item.label }}
          <span
            v-if="requiresShop(item.key)"
            class="navtool-config__shop-tag"
            :class="{ 'is-warn': item.enabled && !enableShop }"
            :title="enableShop ? '購物功能已啟用' : '需先到上方「啟用購物功能」打勾才會出現'"
          >
            {{ enableShop ? '購物' : '⚠ 需開購物' }}
          </span>
        </span>

        <label class="navtool-config__toggle">
          <input
            type="checkbox"
            :checked="item.enabled"
            @change="toggle(item.key, $event.target.checked)"
          />
          <span class="navtool-config__toggle-track">
            <span class="navtool-config__toggle-thumb"></span>
          </span>
        </label>

        <span class="navtool-config__move">
          <button
            type="button"
            :disabled="idx === 0"
            :aria-label="`往上移 ${item.label}`"
            @click="moveUp(item.key)"
          >▲</button>
          <button
            type="button"
            :disabled="idx === items.length - 1"
            :aria-label="`往下移 ${item.label}`"
            @click="moveDown(item.key)"
          >▼</button>
        </span>
      </li>
    </ul>

    <p class="navtool-config__note">
      ⚠ <strong>社群</strong>會渲染為一組並列的社群連結（FB / IG / LINE / YT / X），啟用時讀
      <code>firm.json</code> 的 <code>social</code> 區段，有填值才顯示。
      <br />
      ⚠ <strong>會員中心 / 購物車 / 我的最愛</strong> 為購物相關 icon，
      <strong>需上方「啟用購物功能」打勾才會出現</strong>。
      （在 admin 開「啟用購物」、或 projectType 選 <code>shop</code> 自動啟用）
      <br />
      路由：<code>/member</code> / <code>/shop/cart</code> / <code>/shop/favorite</code> — 若還沒做頁面點下去會 404。
    </p>
  </div>
</template>

<style lang="scss" scoped>
.navtool-config {
  margin-top: 32px;
  padding: 20px;
  background: #161b25;
  border: 1px solid #232a38;
  border-radius: 8px;
}

.navtool-config__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;

  h3 { font-size: 16px; margin: 0; }
}

.navtool-config__current {
  font-weight: 400;
  font-size: 13px;
  color: #6dd6a3;
  margin-left: 4px;
}

.navtool-config__badge {
  font-size: 11px;
  background: rgba(79, 192, 141, 0.15);
  color: #6dd6a3;
  padding: 2px 10px;
  border-radius: 99px;
}

.navtool-config__reset {
  background: transparent;
  color: #c8cfdb;
  border: 1px solid #2a3242;
  border-radius: 6px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;

  &:first-of-type { margin-left: auto; }

  &:hover { background: #1f2532; }

  &--danger {
    color: #ff8478;
    border-color: rgba(255, 132, 120, 0.3);

    &:hover { background: rgba(255, 132, 120, 0.1); }
  }
}

.navtool-config__desc {
  font-size: 12px;
  color: #7a8896;
  margin-bottom: 16px;
}

.navtool-config__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navtool-config__row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 10px;
  background: #1a1f2a;
  border: 1px solid #232a38;
  border-radius: 6px;
}

.navtool-config__order {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #232a38;
  border-radius: 50%;
  font-size: 11px;
  color: #c8cfdb;
}

.navtool-config__icon {
  color: #c8cfdb;
  font-size: 18px;
  display: inline-flex;
}

.navtool-config__label {
  flex: 1;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.navtool-config__shop-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 99px;
  background: rgba(79, 192, 141, 0.12);
  color: #6dd6a3;

  &.is-warn {
    background: rgba(255, 184, 0, 0.12);
    color: #d4b170;
  }
}

.navtool-config__toggle {
  position: relative;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;

    &:checked + .navtool-config__toggle-track {
      background: #4fc08d;

      .navtool-config__toggle-thumb { transform: translateX(16px); }
    }
  }
}

.navtool-config__toggle-track {
  display: block;
  width: 36px;
  height: 20px;
  background: #2a3242;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.navtool-config__toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.navtool-config__move {
  display: flex;
  flex-direction: column;
  gap: 2px;

  button {
    width: 24px;
    height: 16px;
    background: transparent;
    color: #c8cfdb;
    border: 1px solid #2a3242;
    border-radius: 3px;
    font-size: 9px;
    cursor: pointer;
    line-height: 1;

    &:hover:not(:disabled) { background: #232a38; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}

.navtool-config__note {
  margin-top: 16px;
  padding: 10px 12px;
  background: rgba(255, 184, 0, 0.08);
  border: 1px solid rgba(255, 184, 0, 0.2);
  color: #d4b170;
  font-size: 11px;
  line-height: 1.6;
  border-radius: 6px;

  code {
    background: #0f1218;
    padding: 1px 5px;
    border-radius: 3px;
    color: #c8cfdb;
  }
}
</style>
