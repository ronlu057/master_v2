<script setup>
// /admin 專用 layout：空殼，不套站台 header/footer，避免後台界面與站台版面互相干擾
</script>

<template>
  <div class="admin-shell"><slot /></div>
</template>

<style lang="scss" scoped>
.admin-shell {
  min-height: 100vh;
  background: #0f1218;
  color: #e6e9ef;
  font-family: 'Noto Sans TC', 'Inter', sans-serif;
}
</style>
