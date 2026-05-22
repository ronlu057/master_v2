<script setup>
// 全站頁尾 — 臨時站(minimal) 顯示精簡版
const { isMinimal } = useProject()
const appConfig = useAppConfig()
const { data: firmData } = useSiteFirm()
const { data: menuData } = useSiteMenu()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div v-if="!isMinimal" class="container footer__main">
      <div class="footer__col footer__col--brand">
        <p class="footer__name">{{ appConfig.site.name }}</p>
        <p class="footer__slogan">{{ firmData.firm.footer?.title2 || appConfig.site.slogan }}</p>
        <ul class="footer__social">
          <li v-if="firmData.firm.social?.facebook"><a :href="firmData.firm.social.facebook" target="_blank">Facebook</a></li>
          <li v-if="firmData.firm.social?.instagram"><a :href="firmData.firm.social.instagram" target="_blank">Instagram</a></li>
          <li v-if="firmData.firm.social?.line"><a :href="firmData.firm.social.line" target="_blank">LINE</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <p class="footer__title">網站導覽</p>
        <ul>
          <li v-for="item in menuData.footer" :key="item.url">
            <NuxtLink :to="item.url">{{ item.title }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer__col">
        <p class="footer__title">聯絡資訊</p>
        <ul class="footer__contact">
          <li>📧 {{ firmData.firm.mail }}</li>
          <li>📞 {{ firmData.firm.tel }}</li>
          <li>📍 {{ firmData.firm.address }}</li>
        </ul>
      </div>
    </div>

    <div class="container footer__bar">
      <p>© {{ year }} {{ appConfig.site.name }}. All rights reserved.</p>
      <ul class="footer__rules">
        <li v-for="rule in firmData.rules" :key="rule.url">
          <NuxtLink :to="rule.url">{{ rule.title }}</NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  flex-shrink: 0;
  background: var(--color-accent);
  color: rgba(255, 255, 255, 0.78);

  a {
    color: rgba(255, 255, 255, 0.78);
    &:hover { color: #fff; }
  }

  &__main {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1.4fr;
    gap: 40px;
    padding: 56px 20px 32px;
  }

  &__name {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
  }

  &__slogan {
    margin-top: 6px;
    font-size: 14px;
  }

  &__title {
    color: #fff;
    font-weight: 700;
    margin-bottom: 14px;
  }

  &__col ul li {
    margin-bottom: 8px;
    font-size: 14px;
  }

  &__social {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    font-size: 14px;
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 13px;
  }

  &__rules {
    display: flex;
    gap: 16px;
  }
}

@media (max-width: 760px) {
  .footer__main {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .footer__bar {
    flex-direction: column;
    text-align: center;
  }
}
</style>
