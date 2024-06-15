<script setup lang="ts">
import ColorPicker, { type ColorPickerChangeEvent } from 'primevue/colorpicker'
import PalleteIcon from '@/assets/icons/pallete-icon.svg'
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import { debounce } from 'lodash'

const COLORS = [
  '#3575E6',
  '#6D6ED1',
  '#845DCC',
  '#9C45C3',
  '#BD45B7',
  '#CE3C8B',
  '#CE3C8B',
  '#15CCAB',
  '#47D04C',
  '#C5D047',
  '#E49D32',
  '#A58E82',
  '#676F7C',
  '#89909D',
  '#B3B3B3',
]

const emit = defineEmits<{
  (e: 'onColorChange', color: string): void
  (e: 'onClickOutside'): void
  (e: 'onColorChangeEnd'): void
}>()

function lightOrDark(hexColor: string) {
  // If RGB --> Convert it to HEX: http://gist.github.com/983661
  const color = +(
    // @ts-ignore
    ('0x' + hexColor.slice(1).replace(hexColor.length < 5 && /./g, '$&$&'))
  )

  const r = color >> 16
  const g = (color >> 8) & 255
  const b = color & 255

  // HSP equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'black'
  } else {
    return 'white'
  }
}

const { color } = defineProps<{ color: string }>()

const target = ref(null)

const pipetColor = computed(() => {
  return lightOrDark(color)
})

onClickOutside(target, (ev) => {
  // Click in color picker
  if (
    ev.target &&
    ev.target instanceof HTMLDivElement &&
    ev.target.closest('.color-picker-panel')
  )
    return
  emit('onClickOutside')
})
const handleColorPickerChange = (event: ColorPickerChangeEvent) => {
  emit('onColorChange', `#${event.value}`)
}
</script>

<template>
  <div class="pallete" ref="target">
    <div class="pallete__grid">
      <button
        v-for="item in COLORS"
        :key="item"
        :style="{ backgroundColor: item }"
        class="pallete__color"
        @click="$emit('onColorChange', item)"
      ></button>
      <button
        :style="{ backgroundColor: color }"
        class="pallete__color pallete__select"
      >
        <ColorPicker
          class="pallete__color-picker"
          format="hex"
          @change="handleColorPickerChange"
          panel-class="color-picker-panel"
        />
        <PalleteIcon :style="{ fill: lightOrDark(color) }" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pallete {
  display: flex;
  justify-content: center;
  padding: 5px 7px;
  border-radius: 5px;
  border: 1px solid blue;
  &__select {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
  }
  &__color-picker {
    opacity: 0;
    position: absolute;
  }
  &__color {
    width: 20px;
    height: 20px;
    background-color: red;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      filter: brightness(85%);
    }
  }
}
</style>
