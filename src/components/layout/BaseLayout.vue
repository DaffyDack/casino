<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import { useRoute } from 'vue-router'
import { RouteNames } from '@/router'
import { computed } from 'vue'
import { ref } from 'vue'
import { provide } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const route = useRoute()
const isHomeView = computed(() => route.name === RouteNames.Home)

const pageTitle = ref<string>()
const prevRoute = ref<RouteLocationRaw>()
provide('pageTitle', pageTitle)
provide('prevRoute', prevRoute)
</script>

<template>
  <div class="base-layout flex flex-row w-screen h-[calc(100dvh)]">
    <Sidebar />
    <div
      class="w-full h-full flex flex-col overflow-hidden"
      id="fullscreen_container"
    >
      <Header :title="pageTitle" :prev-route="prevRoute" />
      <main
        class="w-full h-full overflow-x-auto overflow-y-auto bg-surface-100 dark:bg-surface-850"
      >
        <RouterView></RouterView>
      </main>
    </div>
  </div>
</template>
<style scoped lang="scss">
@media (max-width: 840px) {
  #fullscreen_container {
    padding-top: 118px;
  }
}
</style>
