<script lang="ts" setup>
import { ref } from 'vue'
import IconButton from './IconButton.vue'
import Menu from './Menu.vue'
import { watch } from 'vue'
import type { PropType } from 'vue'
import type { MenuItem } from 'primevue/menuitem'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'

const props = defineProps({
  menuModel: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
})

const menuEvent = ref()
const menuOpened = ref(false)

const burgerOpenState = () => {
  menuOpened.value = false
}
onMounted(() => {
  document.addEventListener('mouseup', burgerOpenState)
})
onUnmounted(() => {
  document.removeEventListener('mouseup', burgerOpenState)
})
</script>

<template>
  <IconButton
    v-bind="$attrs"
    icon="dotdotdot"
    class="text-white"
    :class="[
      'p-1 w-11 h-11 bg-gray-8 p-3',
      { '!bg-primary-500 rotate-90': menuOpened },
    ]"
    :icon-size="20"
    @click="(menuEvent = $event) && (menuOpened = true)"
  />
  <Menu :event="menuEvent" :model="menuModel" popup />
</template>
