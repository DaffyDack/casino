<script lang="ts" setup>
import type ContextMenu from 'primevue/contextmenu'
import ContextMenuVue from 'primevue/contextmenu'
import { watch } from 'vue'
import { ref } from 'vue'
import pt from '@/presets/wind/contextmenu'

const props = defineProps({
  event: {},
})

const opRef = ref<ContextMenu>()

watch(
  () => props.event,
  (e: any) => {
    opRef.value?.show(e)
  },
)
</script>

<template>
  <ContextMenuVue ref="opRef" :pt="pt" />
</template>
