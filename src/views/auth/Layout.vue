<script lang="ts" setup>
import router, { RouteNames } from '@/router'
import { useUserStore } from '@/stores/user.store'
import { useDark } from '@vueuse/core'

const isDark = useDark()
isDark.value = false

const userStore = useUserStore()
if (userStore.authed) {
  router.push({ name: RouteNames.Home })
}
</script>

<template>
  <div
    class="flex w-screen h-[100dvh] overflow-hidden"
    v-if="!userStore.authed"
  >
    <div class="h-full w-1/2 flex items-center bg-surface-100">
      <div class="min-w-20 w-full"></div>
      <div
        :class="[
          'md:absolute md:z-10 md:left-1/2 md:-translate-x-1/2',
          'shrink-0 flex flex-col justify-center bg-white rounded-lg p-4 h-fit',
        ]"
      >
        <RouterView />
      </div>
      <div class="min-w-10 max-w-32 w-full"></div>
    </div>
    <div class="h-full w-1/2 flex items-center">
      <div class="min-w-10 max-w-44 w-full"></div>
      <div class="shrink-0 flex flex-col justify-center">
        <div class="flex items-center gap-8 mb-10 md:hidden">
          <img src="@/assets/img/bull.svg?image" width="80" class="-mb-2" />
          <div>
            <p class="text-red-600 text-5xl mb-3">Most Valuable Player</p>
            <p class="text-white">
              Комплексное решение для работы с трафиком из
              <span class="text-primary-500 font-medium">Telegram</span>
            </p>
          </div>
        </div>
        <img src="@/assets/img/devices-mvp-demo.png" />
      </div>
      <div class="min-w-20 w-full"></div>
    </div>
  </div>
</template>
