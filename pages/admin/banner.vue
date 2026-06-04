<script setup>
// /admin/banner — Banner 模組設定（PageBanner / BlockBanner 版型切換）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, submitting, load, submit, setPreview, isDirtyKey } = useSiteSettings()

onMounted(load)

const dirty = computed(() => ['pageBanner', 'blockBanner'].some(isDirtyKey))

const message = ref(null)
const onSubmit = async () => {
  const res = await submit()
  message.value = res.ok
    ? { type: 'success', text: '已寫回，站台立即生效。' }
    : { type: 'error', text: res.message }
}
</script>

<template>
  <div class="page">
    <h1 class="page__title">Banner 模組</h1>
    <p class="page__desc">
      內頁 hero 與首頁輪播 banner 的版型切換。新增版型：在
      <code>components/banners/</code> 放對應 <code>.vue</code>，重整這頁即出現在下拉。
    </p>

    <div class="grid">
      <label class="field field--full">
        <span class="field__label">PageBanner（內頁 hero） <em class="field__live">即時預覽</em></span>
        <select :value="state.pageBanner" @change="setPreview('pageBanner', $event.target.value)">
          <option v-for="b in options.pageBanners" :key="b" :value="b">{{ b }}</option>
        </select>
        <span class="field__hint">用於 news / about / contact 等內頁頂部</span>
      </label>

      <label class="field field--full">
        <span class="field__label">BlockBanner（首頁輪播） <em class="field__live">即時預覽</em></span>
        <select :value="state.blockBanner" @change="setPreview('blockBanner', $event.target.value)">
          <option v-for="b in options.blockBanners" :key="b" :value="b">{{ b }}</option>
        </select>
        <span class="field__hint">用於首頁主視覺輪播</span>
      </label>
    </div>

    <div class="actions">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="!dirty || submitting"
        @click="onSubmit"
      >
        {{ submitting ? '寫入中…' : dirty ? '提交寫回 site-settings.json + .env' : '無變動' }}
      </button>
    </div>

    <p v-if="message" :class="['msg', `msg--${message.type}`]">{{ message.text }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;
</style>
