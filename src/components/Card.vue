<script lang="ts" setup>
import { ref } from 'vue'
import IconButton from './form/IconButton.vue'
import { booleanStoredRef } from '@/utils/vue.utils'

const props = defineProps({
  header: {
    type: String,
    default: '',
  },
  foldable: {
    type: Boolean,
    default: false,
  },
  foldKey: {
    type: String,
  },
})

const folded = props.foldKey ? booleanStoredRef(props.foldKey, true) : ref(true)
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded px-3 py-1">
    <!-- Header -->
    <div
      class="flex items-center justify-between gap-2 cursor-pointer my-2 select-none"
      @click="folded = !folded"
    >
      <p
        :class="[
          'font-bold text-sm',
          folded ? 'text-gray-1 dark:text-white/80' : 'text-primary-500',
        ]"
      >
        {{ header }}
      </p>
      <IconButton
        v-if="foldable"
        :icon="folded ? 'angle-down' : 'angle-up'"
        :class="folded ? 'text-gray-1 dark:text-white/80' : 'text-primary-500'"
        class="size-3"
      />
    </div>
    <!-- Content -->
    <KeepAlive>
      <div class="card text-xs my-2" v-if="!folded">
        <slot />
      </div>
    </KeepAlive>
  </div>
</template>
