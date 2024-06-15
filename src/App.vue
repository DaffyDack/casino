<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from './stores/user.store'
import { RouteNames } from './router'
import { watch } from 'vue'
import { ref } from 'vue'
import LoadingBlurred from '@/components/LoadingBlurred.vue'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(true)
watch(
  [() => userStore.authed, () => router.currentRoute.value.meta.requiresAuth],
  ([authed, requiresAuth]) => {
    if (requiresAuth && authed === false) {
      router.push({ name: RouteNames.Login })
    } else {
      isLoading.value = authed === undefined
    }
  },
)
</script>

<template>
  <RouterView v-if="!isLoading" />
  <div v-else class="w-screen h-screen">
    <LoadingBlurred :text="$t('loading')" class="text-xl gap-4" />
  </div>
  <!-- PrimeVue components -->
  <Toast />
  <ConfirmDialog />
</template>

<style scoped lang="scss"></style>
