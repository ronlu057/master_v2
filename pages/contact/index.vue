<script setup>
// 聯絡我們（白皮書 §7：表單欄位 / CSRF / submit）
const { data: subjects } = await useApiData('/contact/subjects', {
  key: 'contact-subjects',
  default: () => [],
})
const { data: firmData } = await useSiteFirm()

const form = reactive({
  name: '',
  tel: '',
  mail: '',
  theme: '',
  comment: '',
  gender: '',
  company: '',
  address: '',
})

const submitting = ref(false)
const result = ref('') // '' | 'ok' | 'error'
const errorMsg = ref('')

async function submit() {
  result.value = ''
  errorMsg.value = ''

  // 必填驗證（白皮書 §7.2）
  if (!form.name || !form.tel || !form.mail || !form.theme || !form.comment) {
    result.value = 'error'
    errorMsg.value = '請填寫所有必填欄位（*）。'
    return
  }
  if (!/^\d{6,20}$/.test(form.tel)) {
    result.value = 'error'
    errorMsg.value = '電話請填 6–20 位數字。'
    return
  }

  submitting.value = true
  try {
    // 1. 取 CSRF token
    const csrf = await $api('/contact/csrf')
    // 2. 送出表單
    const res = await $api('/contact/submit', {
      method: 'POST',
      body: { ...form, [csrf.csrf_name]: csrf.csrf_value },
    })
    if (res?.success) {
      result.value = 'ok'
      Object.keys(form).forEach((k) => (form[k] = ''))
    } else {
      result.value = 'error'
      errorMsg.value = '送出失敗，請稍後再試。'
    }
  } catch {
    result.value = 'error'
    errorMsg.value = '送出失敗，請稍後再試。'
  } finally {
    submitting.value = false
  }
}

useSeoMeta({ title: '聯絡我們 — 母版專案', description: '有任何需求歡迎與我們聯繫。' })
</script>

<template>
  <div>
    <PageBanner page="contact" title="聯絡我們" subtitle="有任何需求，歡迎與我們聯繫" />

    <div class="container contact">
      <!-- 聯絡資訊 -->
      <aside class="contact__info">
        <h2>聯絡資訊</h2>
        <ul>
          <li><strong>電話</strong>{{ firmData.firm.tel }}</li>
          <li><strong>Email</strong>{{ firmData.firm.mail }}</li>
          <li><strong>地址</strong>{{ firmData.firm.address }}</li>
        </ul>
      </aside>

      <!-- 表單 -->
      <form class="contact__form" @submit.prevent="submit">
        <div class="field-row">
          <label class="field">
            <span>姓名 *</span>
            <input v-model="form.name" type="text" placeholder="請輸入姓名" />
          </label>
          <label class="field">
            <span>電話 *</span>
            <input v-model="form.tel" type="tel" placeholder="6–20 位數字" />
          </label>
        </div>

        <div class="field-row">
          <label class="field">
            <span>Email *</span>
            <input v-model="form.mail" type="email" placeholder="example@mail.com" />
          </label>
          <label class="field">
            <span>主題 *</span>
            <select v-model="form.theme">
              <option value="">請選擇主題</option>
              <option v-for="s in subjects" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="field-row">
          <label class="field">
            <span>公司名稱</span>
            <input v-model="form.company" type="text" placeholder="選填" />
          </label>
          <label class="field">
            <span>地址</span>
            <input v-model="form.address" type="text" placeholder="選填" />
          </label>
        </div>

        <label class="field">
          <span>需求內容 *</span>
          <textarea v-model="form.comment" rows="5" placeholder="請描述您的需求" />
        </label>

        <p v-if="result === 'ok'" class="msg msg--ok">✓ 已成功送出，我們將盡快與您聯繫。</p>
        <p v-if="result === 'error'" class="msg msg--err">✕ {{ errorMsg }}</p>

        <button type="submit" class="btn btn--primary" :disabled="submitting">
          {{ submitting ? '送出中…' : '送出表單' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: fluid(40);
  padding: fluid(56) fluid(20) fluid(80);

  &__info {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: fluid(28);
    height: fit-content;

    h2 {
      font-size: fluid-fz(20);
      margin-bottom: fluid(16);
    }

    li {
      margin-bottom: fluid(14);
      font-size: fluid-fz(14);

      strong {
        display: block;
        color: var(--color-primary);
        margin-bottom: 2px;
      }
    }
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: fluid(16);
}

.field {
  display: block;
  margin-bottom: fluid(16);

  span {
    display: block;
    font-size: fluid-fz(14);
    font-weight: 600;
    margin-bottom: fluid(6);
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: fluid(11) fluid(14);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-bg);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}

.msg {
  padding: fluid(12) fluid(16);
  border-radius: var(--radius);
  font-size: fluid-fz(14);
  margin-bottom: fluid(16);

  &--ok {
    background: #e7f6ee;
    color: #1b7f4d;
  }
  &--err {
    background: #fdeceb;
    color: #c0392b;
  }
}

@include rwd-768 {
  .contact {
    grid-template-columns: 1fr;
  }
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
