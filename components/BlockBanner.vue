<script setup>
// Banner block — 自動輪播
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
})

const active = ref(0)
let timer = null

onMounted(() => {
  if (props.rows.length > 1) {
    timer = setInterval(() => {
      active.value = (active.value + 1) % props.rows.length
    }, 4500)
  }
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section v-if="rows.length" class="banner">
    <div
      v-for="(row, i) in rows"
      :key="i"
      class="banner__slide"
      :class="{ 'is-active': i === active }"
    >
      <component :is="row.link ? 'NuxtLink' : 'div'" :to="row.link || undefined">
        <img :src="row.image?.pc" :alt="row.title" class="banner__img" />
        <div v-if="row.title" class="banner__caption">
          <div class="container">
            <h2>{{ row.title }}</h2>
          </div>
        </div>
      </component>
    </div>

    <div v-if="rows.length > 1" class="banner__dots">
      <button
        v-for="(row, i) in rows"
        :key="i"
        :class="{ 'is-active': i === active }"
        :aria-label="`第 ${i + 1} 張`"
        @click="active = i"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner {
  position: relative;
  aspect-ratio: 16 / 6;
  background: var(--color-surface);

  &__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.6s ease;

    &.is-active {
      opacity: 1;
    }

    a,
    div {
      display: block;
      height: 100%;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__caption {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.45), transparent);

    h2 {
      color: #fff;
      font-size: 40px;
      max-width: 540px;
    }
  }

  &__dots {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;

    button {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.5);

      &.is-active {
        background: #fff;
        width: 28px;
        border-radius: 5px;
      }
    }
  }
}

@media (max-width: 700px) {
  .banner {
    aspect-ratio: 4 / 5;
  }
  .banner__caption h2 {
    font-size: 24px;
  }
}
</style>
