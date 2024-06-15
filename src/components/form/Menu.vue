<script lang="ts" setup>
import type Menu from 'primevue/menu'
import MenuVue from 'primevue/menu'
import { watch } from 'vue'
import { ref } from 'vue'
import pt from '@/presets/wind/menu'
import { usePassThrough } from 'primevue/passthrough'
const props = defineProps({
  event: {},
})

const opRef = ref<Menu>()

watch(
  () => props.event,
  (e: any) => {
    opRef.value?.show(e)
  },
)
</script>

<template>
  <MenuVue ref="opRef" :pt="pt" />
</template>
