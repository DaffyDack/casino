<script lang="ts" setup>
import Button from 'primevue/button'
import pt from '@/presets/wind/button'
import type { PropType } from 'vue'
import { usePassThrough } from 'primevue/passthrough'

interface PassThroughArguments {
  context: {
    disabled: boolean
  }
}

const props = defineProps({
  theme: {
    type: String as PropType<'blue' | 'red' | 'green' | 'gray' | 'white'>,
    default: 'blue',
  },
  outlined: {
    default: false,
  },
})
</script>

<template>
  <Button
    :pt="{
      root: ({ context }: PassThroughArguments) => ({
        class: [
          'py-3 px-6 flex items-center',
          'rounded-md',
          {
            'cursor-pointer hover:opacity-80 active:opacity-100':
              !context.disabled,
          },
          'text-sm',
          outlined
            ? context.disabled
              ? ['border border-gray-6 text-gray-4']
              : [
                  'border',
                  {
                    'text-primary-500 border-primary-500': theme === 'blue',
                    'text-red-600 border-red-600': theme === 'red',
                    'text-green-600 border-green-600': theme === 'green',
                    'text-gray-1 dark:text-gray-100 border-gray-6':
                      theme === 'gray',
                    'bg-white text-black': theme === 'white',
                  },
                ]
            : context.disabled
              ? ['border border-gray-6 text-gray-4']
              : [
                  {
                    'bg-primary-500 text-white': theme === 'blue',
                    'bg-red-600 text-white': theme === 'red',
                    'bg-green-600 text-white': theme === 'green',
                    'bg-white text-black': theme === 'white',
                  },
                ],
        ],
      }),
      label: {
        class: 'flex-0',
      },
    }"
  />
</template>
