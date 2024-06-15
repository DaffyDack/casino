<script lang="ts" setup>
import { ref } from 'vue'
import type { PropType } from 'vue'
import IconImage from '../IconImage.vue'
import { VueSpinner } from 'vue3-spinners'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  iconSide: {
    type: String as PropType<'left' | 'right'>,
    default: 'right',
  },
  iconClass: {
    type: String,
  },
  theme: {
    type: String as PropType<keyof typeof STYLES>,
    default: 'primary',
  },
  loading: {
    type: Boolean,
    default: null,
  },
})
const emit = defineEmits<{
  clickIcon: []
}>()

const STYLES = {
  primary: {
    root: {
      class:
        'px-2 h-8 flex items-center rounded border border-gray-6 dark:border-surface-600 dark:bg-surface-700 rounded-md',
    },
    icon: {
      class: 'ml-auto cursor-pointer hover:opacity-80 w-4',
    },
    input: {
      class: 'text-sm outline-none border-none dark:text-white/80 grow',
    },
  },
  secondary: {
    root: {
      class: 'bg-gray-8 px-2 flex items-center rounded h-8',
    },
    icon: {
      class: 'mr-3 w-4 text-gray-5',
    },
    input: {
      class: 'bg-transparent outline-none grow',
    },
  },
} as const
const style = STYLES[props.theme]

const value = defineModel<string | number | null>()

const focused = ref(false)
</script>

<template>
  <div
    v-bind="style.root"
    class="relative"
    :class="{ '!border-primary-500': focused }"
  >
    <IconImage
      v-if="iconSide === 'left'"
      :name="icon"
      v-bind="style.icon"
      :class="['select-none', iconClass]"
    />
    <input
      @focusin="focused = true"
      @focusout="focused = false"
      type="text"
      v-bind="{ ...$attrs, ...style.input }"
      v-model="value"
      class="bg-transparent border-none h-full"
      :class="{ 'message-input-loader': loading !== null }"
    />
    <VueSpinner class="message-search-loader" v-if="props.loading" />
    <IconImage
      v-if="iconSide === 'right'"
      :class="['select-none', iconClass]"
      :name="icon"
      v-bind="style.icon"
      @click="emit('clickIcon')"
    />
  </div>
</template>

<style lang="scss" scoped>
.message-input-loader {
  padding-right: 15px;
}
.message-search-loader {
  position: absolute;
  width: 15px;
  height: 15px;
  color: white;
  right: 10px;
}
</style>
