<script setup>
// 臨時站首頁 — 精簡單頁（即將開幕 / 活動過渡頁）
const appConfig = useAppConfig()
const { data: firmData } = await useSiteFirm()
</script>

<template>
  <section class="minimal">
    <div class="minimal__inner">
      <p class="minimal__eyebrow">COMING SOON</p>
      <h1 class="minimal__title">{{ appConfig.site.name }}</h1>
      <p class="minimal__desc">網站即將開幕，敬請期待。</p>

      <div class="minimal__contact">
        <p v-if="firmData.firm.mail">📧 {{ firmData.firm.mail }}</p>
        <p v-if="firmData.firm.tel">📞 {{ firmData.firm.tel }}</p>
        <p v-if="firmData.firm.address">📍 {{ firmData.firm.address }}</p>
      </div>

      <NuxtLink to="/contact" class="btn btn--primary">聯絡我們</NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.minimal {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-h));
  padding: fluid(48) fluid(24);
  background: linear-gradient(135deg, var(--color-surface), #fff);
  text-align: center;

  &__inner {
    max-width: fluid(540);
  }

  &__eyebrow {
    letter-spacing: 4px;
    color: var(--color-primary);
    font-weight: 700;
  }

  &__title {
    font-size: fluid(44);
    margin: fluid(12) 0;
  }

  &__desc {
    color: var(--color-text-muted);
    font-size: 17px;
    margin-bottom: fluid(28);
  }

  &__contact {
    display: inline-flex;
    flex-direction: column;
    gap: fluid(6);
    padding: fluid(20) fluid(32);
    margin-bottom: fluid(28);
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: 15px;
  }
}

@include rwd-480 {
  .minimal__title {
    font-size: 32px;
  }
}
</style>
