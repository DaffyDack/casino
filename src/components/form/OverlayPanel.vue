<script lang="ts" setup>
import op from 'primevue/overlaypanel'
import pt from '@/presets/wind/overlaypanel'
import { ref } from 'vue'
import { watch } from 'vue'
import type OverlayPanel from 'primevue/overlaypanel'
import { usePassThrough } from 'primevue/passthrough'

const props = defineProps({
  transparent: {
    default: false,
  },
  event: {},
})

const opRef = ref<OverlayPanel>()

watch(
  () => props.event,
  (e: any) => {
    if (e) opRef.value?.show(e)
    else opRef.value?.hide()
  },
)
</script>

<template>
  <op
    ref="opRef"
    :pt="
      usePassThrough(pt, {
        root: {
          class: [transparent ? '' : 'bg-white'],
        },
      })
    "
  >
    <slot></slot>
  </op>
</template>
